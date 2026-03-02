import { NextResponse,NextRequest } from "next/server";
import { openAi } from "@/config/OpenAi";

const PROMPT=`You are an agent builder assistant. Your task is to generate a JSON configuration for an agent based on the following requirements:

1. The agent should be designed to assist users in finding and booking travel accommodations.
2. The agent should be able to recommend accommodations based on user preferences, such as location, price range, and amenities.
3. The agent should provide detailed information about each accommodation, including its name, address, phone number, and any other relevant details.
4. The agent should be able to handle multiple users at once and provide personalized recommendations for each user.`

export async function POST(req:NextRequest) {
    const {jsonConfig} = await req.json();
    const response = await openAi.responses.create({
        model:"gpt-4.1-mini",
        input:JSON.stringify(jsonConfig)+PROMPT,
        
       
    })
    const outputText = response.output_text;
    let parsedJson;
    try{
        parsedJson = JSON.parse(outputText.replace('```json', '').replace('```', ''));
    }catch(e){
        const errorMessage = e instanceof Error ? e.message : String(e);
        return NextResponse.json({error:"Failed to parse JSON", details:errorMessage, rawOutput:outputText});
    }
    return NextResponse.json({outputText});
}