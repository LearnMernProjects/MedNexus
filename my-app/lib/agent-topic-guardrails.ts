type ToolLike = {
  name?: unknown;
  description?: unknown;
  url?: unknown;
  parameters?: Record<string, unknown>;
};

type AgentLike = {
  name?: unknown;
  instructions?: unknown;
};

type BuildInstructionInput = {
  agentName?: unknown;
  agents?: unknown[];
  tools?: unknown[];
};

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function compactLines(values: string[], max = 8): string[] {
  const seen = new Set<string>();
  const lines: string[] = [];

  for (const value of values) {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    lines.push(normalized);
    if (lines.length >= max) break;
  }

  return lines;
}

export function buildTopicScopedInstructions(input: BuildInstructionInput): string {
  const tools = (Array.isArray(input.tools) ? input.tools : []) as ToolLike[];
  const agents = (Array.isArray(input.agents) ? input.agents : []) as AgentLike[];

  const topicHints = compactLines([
    cleanText(input.agentName),
    ...agents.flatMap((agent) => [
      cleanText(agent?.name),
      cleanText(agent?.instructions),
    ]),
    ...tools.flatMap((tool) => {
      const params = tool?.parameters && typeof tool.parameters === "object"
        ? Object.keys(tool.parameters)
        : [];

      const urlText = cleanText(tool?.url)
        .replace(/^https?:\/\//i, "")
        .split(/[?#]/)[0];

      return [
        cleanText(tool?.name),
        cleanText(tool?.description),
        urlText,
        params.length ? `parameters: ${params.join(", ")}` : "",
      ];
    }),
  ]);

  const hintBlock = topicHints.length
    ? topicHints.map((line) => `- ${line}`).join("\n")
    : "- No explicit topic hints were provided. Infer scope only from available tools.";

  return [
    "You are a domain-restricted assistant.",
    "Infer the allowed topic strictly from the configured agent and API tool context below.",
    "",
    "Topic context hints:",
    hintBlock,
    "",
    "Rules:",
    "1. Answer only questions relevant to the inferred topic/domain from the context above.",
    "2. If the user asks anything outside that topic, respond with exactly:",
    '"I can\'t answer because it\'s not relevant to topic"',
    "3. Do not provide partial or alternative answers for out-of-scope requests.",
    "4. For factual questions that depend on provided API/tool data, call the relevant tool before answering.",
    "5. If a required tool call fails or returns no usable data, clearly state that data is unavailable for the requested parameters.",
    "6. Keep responses focused on the inferred topic only.",
  ].join("\n");
}
