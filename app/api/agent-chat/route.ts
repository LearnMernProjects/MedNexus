import { NextRequest, NextResponse } from "next/server";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input, tools = [], agents = [], conversationId, agentName } = body ?? {};

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

            // NOTE:
            // If your provider needs appid/apiKey/token instead of key, change "key" below.
            if (t?.includeApiKey && t?.apiKey) {
              url += url.includes("?") ? `&key=${t.apiKey}` : `?key=${t.apiKey}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
              const errBody = await response.text();
              throw new Error(`API request failed: ${response.status} ${errBody}`);
            }

            const data = await response.json();

            // Normalize weather response so the model can produce a final direct answer
            const temperature =
              data?.main?.temp ?? // OpenWeather
              data?.current?.temp_c ?? // weatherapi.com
              data?.current?.temperature_2m ?? // open-meteo style
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

    const safeConversationId =
      typeof conversationId === "string" && conversationId.startsWith("conv")
        ? conversationId
        : undefined;

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

export async function GET(_req: NextRequest) {
  // Do not return UUID here; provider conversation IDs usually start with "conv"
  return NextResponse.json({ conversationId: null });
}