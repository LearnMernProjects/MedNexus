import { NextResponse,NextRequest } from "next/server";
import { getOpenAiClient } from "@/config/OpenAi";

const PROMPT=`You are an agent builder assistant. Your task is to generate a JSON configuration for an agent based on the following requirements:

1. The agent should be designed to assist users in finding and booking travel accommodations.
2. The agent should be able to recommend accommodations based on user preferences, such as location, price range, and amenities.
3. The agent should provide detailed information about each accommodation, including its name, address, phone number, and any other relevant details.
4. The agent should be able to handle multiple users at once and provide personalized recommendations for each user.`

export async function POST(req:NextRequest) {
    try {
        const {jsonConfig} = await req.json();

        if (!jsonConfig) {
            return NextResponse.json({ error: "Missing jsonConfig in request body" }, { status: 400 });
        }

        const openAi = getOpenAiClient();
        if (!openAi) {
            return NextResponse.json({ error: "Missing OpenAI API key", details: "Set OPENAI_API_KEY (or NEXT_PUBLIC_OPENAI_API_KEY) in your environment." }, { status: 500 });
        }

        const response = await openAi.responses.create({
            model:"gpt-4.1-mini",
            input:JSON.stringify(jsonConfig)+PROMPT,
        });

        const outputText = response.output_text;
        let parsedJson;
        try{
            parsedJson = JSON.parse(outputText.replace('```json', '').replace('```', ''));
        }catch(e){
            const errorMessage = e instanceof Error ? e.message : String(e);
            return NextResponse.json({error:"Failed to parse JSON", details:errorMessage, rawOutput:outputText}, { status: 422 });
        }
        return NextResponse.json({parsedJson, rawOutput:outputText});
    } catch (e: any) {
        const message = e?.message ?? "Unknown server error";
        const status = typeof e?.status === "number" ? e.status : 500;
        return NextResponse.json({ error: "Agent config generation failed", details: message }, { status });
    }
}