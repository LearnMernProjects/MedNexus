import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import OpenAI from "openai";
import { buildTopicScopedInstructions } from "../../../lib/agent-topic-guardrails";
import {
  createToolParameterSchema,
  executeToolHttpRequest,
} from "../../../lib/agent-tool-runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractFinalOutput(result: any): string {
  if (typeof result?.finalOutput === "string") return result.finalOutput;
  if (typeof result?.output_text === "string") return result.output_text;
  if (typeof result?.text === "string") return result.text;

  try {
    return JSON.stringify(result?.finalOutput ?? result ?? "");
  } catch {
    return "";
  }
}

function getConvexClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return null;
  return new ConvexHttpClient(convexUrl);
}

async function getAgentDetail(agentId: string) {
  const convex = getConvexClient();
  if (!convex) {
    return { error: "Missing NEXT_PUBLIC_CONVEX_URL", status: 500 as const };
  }

  const agentDetail = await convex.query(api.agent.GetAgentById, { agentId });
  return { data: agentDetail, status: 200 as const };
}

async function getOrCreateConversationId(params: {
  openai: OpenAI;
  agentId: string;
  userId: string;
}) {
  try {
    const convex = getConvexClient();
    if (!convex) return null;

    const agentDetail = await convex.query(api.agent.GetAgentById, {
      agentId: params.agentId,
    });

    if (!agentDetail?._id) return null;

    const conversationDetail = await convex.query(
      api.conversation.GetConversationById,
      {
        agentId: agentDetail._id,
        userId: params.userId as any,
      }
    );

    if (conversationDetail?.conversationId) {
      return conversationDetail.conversationId;
    }

    const { id: conversationId } =
      await params.openai.conversations.create();

    await convex.mutation(api.conversation.CreateConversation, {
      conversationId,
      agentId: agentDetail._id,
      userId: params.userId as any,
    });

    return conversationId;
  } catch (error) {
    console.error("conversation bootstrap error:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const requestOrigin = host ? `${proto}://${host}` : undefined;

  try {
    const body = await request.json();
    const {
      agentId,
      input,
      tools = [],
      agents = [],
      conversationId,
      agentName,
      userId,
    } = body ?? {};

    if (typeof input === "string" && input.trim().length > 0) {
      const generatedTools = (Array.isArray(tools) ? tools : [])
        .filter((t: any) => t?.name && t?.url)
        .map((t: any) => {
          const paramSchema = createToolParameterSchema(t);

          return tool({
            name: String(t.name),
            description: String(t?.description ?? ""),
            parameters: paramSchema,
            async execute(params: Record<string, any>) {
              return executeToolHttpRequest(t, params, { requestOrigin });
            },
          });
        });

      const createdAgents = (Array.isArray(agents) ? agents : []).map(
        (agent: any) =>
          new Agent({
            name: String(agent?.name ?? "agent"),
            instructions: String(agent?.instructions ?? ""),
            tools: generatedTools,
          })
      );

      const finalAgent = Agent.create({
        name: String(agentName ?? "orchestrator"),
        instructions: buildTopicScopedInstructions({
          agentName,
          agents,
          tools,
        }),
        tools: generatedTools,
        handoffs: createdAgents,
      });

      let safeConversationId =
        typeof conversationId === "string" &&
        conversationId.startsWith("conv")
          ? conversationId
          : undefined;

      if (!safeConversationId && agentId && userId) {
        safeConversationId =
          (await getOrCreateConversationId({
            openai,
            agentId: String(agentId),
            userId: String(userId),
          })) ?? undefined;
      }

      const result = safeConversationId
        ? await run(finalAgent, input, {
            conversationId: safeConversationId,
          })
        : await run(finalAgent, input);

      const output = extractFinalOutput(result);

      return new Response(output, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    if (!agentId) {
      return NextResponse.json(
        { error: "agentId is required" },
        { status: 400 }
      );
    }

    const result = await getAgentDetail(String(agentId));
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("agent-sdk POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const agentId = request.nextUrl.searchParams.get("agentId");
    const userId = request.nextUrl.searchParams.get("userId");

    if (agentId && userId) {
      const conversationId = await getOrCreateConversationId({
        openai,
        agentId,
        userId,
      });

      return NextResponse.json(
        { conversationId: conversationId ?? null },
        { status: 200 }
      );
    }

    if (!agentId) {
      return NextResponse.json(
        { conversationId: null },
        { status: 200 }
      );
    }

    const result = await getAgentDetail(agentId);
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("agent-sdk GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}