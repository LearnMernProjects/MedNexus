import { OpenAI } from "openai";

export function getOpenAiClient() {
    const apiKey = process.env.OPENAI_API_KEY ?? process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) return null;

    return new OpenAI({ apiKey });
}