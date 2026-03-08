import { NextRequest, NextResponse } from "next/server";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import OpenAI from "openai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
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
  if (!convexUrl) {
    return null;
  }

  return new ConvexHttpClient(convexUrl);
}

async function getOrCreateConversationId(params: {
  openai: OpenAI;
  agentId: string;
  userId: string;
}) {
  try {
    const convex = getConvexClient();
    if (!convex) {
      return null;
    }

    const agentDetail = await convex.query(api.agent.GetAgentById, {
      agentId: params.agentId,
    });

    if (!agentDetail?._id) {
      return null;
    }

    const conversationDetail = await convex.query(api.conversation.GetConversationById, {
      agentId: agentDetail._id,
      userId: params.userId as any,
    });

    let conversationId_: string | null = conversationDetail?.conversationId ?? null;

    if (!conversationId_) {
      const { id: conversationId } = await params.openai.conversations.create({
        metadata: {
          agentId: String(agentDetail._id),
        },
      });

      conversationId_ = conversationId;

      await convex.mutation(api.conversation.CreateConversation, {
        conversationId,
        agentId: agentDetail._id,
        userId: params.userId as any,
      });
    }

    return conversationId_;
  } catch (error) {
    console.error("conversation bootstrap error:", error);
    return null;
  }
}

export async function POST(request: Request) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const requestOrigin = host ? `${proto}://${host}` : undefined;

  try {
    const body = await request.json();
    const {
      input,
      tools = [],
      agents = [],
      conversationId,
      agentName,
      agentId,
      userId,
    } = body ?? {};

    if (!input || typeof input !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

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

    const createdAgents = (Array.isArray(agents) ? agents : []).map((agent: any) => {
      return new Agent({
        name: String(agent?.name ?? "agent"),
        instructions: String(agent?.instructions ?? ""),
        tools: generatedTools,
      });
    });

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
      typeof conversationId === "string" && conversationId.startsWith("conv")
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
      ? await run(finalAgent, input, { conversationId: safeConversationId })
      : await run(finalAgent, input);

    const output = extractFinalOutput(result);

    return new Response(output, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("Agent Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const agentId = req.nextUrl.searchParams.get("agentId");
    const userId = req.nextUrl.searchParams.get("userId");

    if (agentId && userId) {
      const conversationId_ = await getOrCreateConversationId({
        openai,
        agentId,
        userId,
      });

      return NextResponse.json({ conversationId: conversationId_ ?? null });
    }

    return NextResponse.json({ conversationId: null });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
