import { z } from "zod";

type ToolConfigLike = {
  name?: unknown;
  description?: unknown;
  url?: unknown;
  method?: unknown;
  includeApiKey?: unknown;
  apiKey?: unknown;
  apiKeyParamName?: unknown;
  parameters?: unknown;
  bodyParams?: unknown;
};

function inferParamType(paramName: string) {
  if (/(^is|^has|enabled|active|open)/i.test(paramName)) return z.boolean();
  if (/(price|amount|count|limit|lat|latitude|lng|longitude|radius|max|min|budget|age|page|size)/i.test(paramName)) {
    return z.coerce.number();
  }
  return z.string();
}

function parseTypeToZod(type: unknown, key: string) {
  const asString = typeof type === "string" ? type.toLowerCase() : "";
  if (asString === "string") return z.string();
  if (asString === "number") return z.coerce.number();
  if (asString === "boolean") return z.boolean();

  if (type && typeof type === "object" && "type" in (type as Record<string, unknown>)) {
    return parseTypeToZod((type as Record<string, unknown>).type, key);
  }

  return inferParamType(key);
}

function extractTemplateParams(url: string) {
  const names = new Set<string>();
  const regex = /\{([a-zA-Z0-9_]+)\}/g;
  let match: RegExpExecArray | null = null;

  while ((match = regex.exec(url)) !== null) {
    if (match[1]) names.add(match[1]);
  }

  return [...names];
}

export function createToolParameterSchema(toolConfig: ToolConfigLike) {
  const explicit =
    toolConfig?.parameters && typeof toolConfig.parameters === "object"
      ? (toolConfig.parameters as Record<string, unknown>)
      : {};

  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [key, type] of Object.entries(explicit)) {
    shape[key] = parseTypeToZod(type, key);
  }

  const url = String(toolConfig?.url ?? "");
  for (const key of extractTemplateParams(url)) {
    if (!shape[key]) {
      shape[key] = inferParamType(key);
    }
  }

  return z.object(shape);
}

function replaceTemplateTokens(value: unknown, params: Record<string, unknown>): unknown {
  if (typeof value === "string") {
    return value.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => {
      const replacement = params[key];
      return replacement === undefined || replacement === null
        ? ""
        : String(replacement);
    });
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceTemplateTokens(item, params));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        replaceTemplateTokens(nested, params),
      ])
    );
  }

  return value;
}

function parseBodyTemplate(bodyParams: unknown): unknown {
  if (typeof bodyParams === "string") {
    const text = bodyParams.trim();
    if (!text) return undefined;
    try {
      return JSON.parse(text);
    } catch {
      return undefined;
    }
  }

  if (bodyParams && typeof bodyParams === "object") {
    return bodyParams;
  }

  return undefined;
}

export async function executeToolHttpRequest(
  toolConfig: ToolConfigLike,
  params: Record<string, unknown>,
  options?: { requestOrigin?: string }
) {
  const method = String(toolConfig?.method ?? "GET").toUpperCase();
  const rawUrlInput = String(toolConfig?.url ?? "").trim();
  let rawUrl = rawUrlInput;

  if (options?.requestOrigin) {
    try {
      const requestOriginUrl = new URL(options.requestOrigin);

      if (rawUrlInput.startsWith("/")) {
        rawUrl = new URL(rawUrlInput, requestOriginUrl.origin).toString();
      } else {
        const parsedToolUrl = new URL(rawUrlInput);
        const isLocalTunnel = parsedToolUrl.hostname.endsWith(".loca.lt");
        const isApiPath = parsedToolUrl.pathname.startsWith("/api/");

        if (isLocalTunnel && isApiPath) {
          rawUrl = new URL(
            `${parsedToolUrl.pathname}${parsedToolUrl.search}`,
            requestOriginUrl.origin
          ).toString();
        }
      }
    } catch {
      rawUrl = rawUrlInput;
    }
  }

  let resolvedUrl = rawUrl;

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    resolvedUrl = resolvedUrl.replace(`{${key}}`, encodeURIComponent(String(value)));
  }

  const apiKeyRaw = String(toolConfig?.apiKey ?? "").trim();
  let apiKey = apiKeyRaw;
  const includeApiKey = Boolean(toolConfig?.includeApiKey);
  const apiKeyParamName = String(toolConfig?.apiKeyParamName ?? "apiKey").trim() || "apiKey";

  if (includeApiKey && apiKeyRaw.includes("&")) {
    const [head, ...tail] = apiKeyRaw.split("&");
    apiKey = head.trim();
    const extraQuery = tail.join("&").trim();

    if (extraQuery) {
      resolvedUrl += resolvedUrl.includes("?")
        ? (resolvedUrl.endsWith("?") || resolvedUrl.endsWith("&") ? "" : "&") + extraQuery
        : `?${extraQuery}`;
    }
  }

  if (includeApiKey && apiKey) {
    if (resolvedUrl.includes(`{${apiKeyParamName}}`)) {
      resolvedUrl = resolvedUrl.replace(
        `{${apiKeyParamName}}`,
        encodeURIComponent(apiKey)
      );
    } else if (!new RegExp(`([?&])${apiKeyParamName}=`).test(resolvedUrl)) {
      resolvedUrl += resolvedUrl.includes("?")
        ? `&${encodeURIComponent(apiKeyParamName)}=${encodeURIComponent(apiKey)}`
        : `?${encodeURIComponent(apiKeyParamName)}=${encodeURIComponent(apiKey)}`;
    }
  }

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    resolvedUrl = resolvedUrl.replace(`{${key}}`, encodeURIComponent(String(value)));
  }

  const hasTemplateInUrl = /\{[a-zA-Z0-9_]+\}/.test(resolvedUrl);
  const headers: Record<string, string> = {};
  let body: string | undefined;

  if (method === "GET") {
    const urlObj = new URL(resolvedUrl);
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (urlObj.searchParams.has(key)) continue;
      if (rawUrl.includes(`{${key}}`)) continue;
      urlObj.searchParams.set(key, String(value));
    }
    resolvedUrl = urlObj.toString();
  } else {
    headers["Content-Type"] = "application/json";
    const baseBodyTemplate = parseBodyTemplate(toolConfig?.bodyParams);
    const resolvedBody = replaceTemplateTokens(baseBodyTemplate ?? params, params);
    body = JSON.stringify(resolvedBody ?? {});
  }

  if (hasTemplateInUrl) {
    throw new Error(`Missing values for URL placeholders in tool URL: ${resolvedUrl}`);
  }

  const response = await fetch(resolvedUrl, {
    method,
    headers,
    body,
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`API request failed: ${response.status} ${errBody}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  return {
    request: {
      method,
      url: resolvedUrl,
      params,
      body: body ? JSON.parse(body) : null,
    },
    data,
  };
}
