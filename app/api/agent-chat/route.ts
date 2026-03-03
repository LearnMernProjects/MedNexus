import { NextRequest, NextResponse } from "next/server";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import OpenAI from "openai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

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
        const paramSchema = z.object(
          Object.fromEntries(
            Object.entries(t?.parameters ?? {}).map(([key, type]) => {
              if (type === "string") return [key, z.string()];
              if (type === "number") return [key, z.number()];
              if (type === "boolean") return [key, z.boolean()];
              return [key, z.any()];
            })
          )
        );

        return tool({
          name: String(t.name),
          description: String(t?.description ?? ""),
          parameters: paramSchema,
          async execute(params: Record<string, any>) {
            let url = String(t.url);

            for (const key in params) {
              url = url.replace(`{${key}}`, encodeURIComponent(String(params[key])));
            }

            if (t?.includeApiKey && t?.apiKey) {
              url += url.includes("?") ? `&key=${t.apiKey}` : `?key=${t.apiKey}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
              const errBody = await response.text();
              throw new Error(`API request failed: ${response.status} ${errBody}`);
            }

            const data = await response.json();

            const temperature =
              data?.main?.temp ??
              data?.current?.temp_c ??
              data?.current?.temperature_2m ??
              data?.temperature ??
              null;

            return {
              city: params?.city ?? params?.q ?? "unknown",
              temperature,
              units: "C",
              raw: data,
            };
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
      instructions:
        "Always use available tools for weather questions. Return the final numeric weather/temperature answer directly (not 'fetching' or 'querying').",
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
