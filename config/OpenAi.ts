import {    api } from "@/convex/_generated/api";
import OpenAi, { OpenAI } from "openai";
export const openAi= new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})