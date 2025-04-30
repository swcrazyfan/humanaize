import { NextResponse } from 'next/server';
import { systemPrompt } from '../humanaize/utils/instr';
import { writingSamples } from '../humanaize/utils/samples';

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const openAIBaseUrl = process.env.OPEN_AI_BASE_URL || "https://api.openai.com/v1";
const modelName = process.env.MODEL_NAME;
const defaultModel = "gpt-4o";

export async function POST(request: Request) {
    try {
        console.log("=====================================");
        console.log("POST /api/gpt");
        const { aiText } = await request.json();
        console.log("User text: ", aiText);

        // Determine which model to use
        // Use MODEL_NAME if OPEN_AI_BASE_URL is set AND MODEL_NAME is set, otherwise use default
        const effectiveModel = process.env.OPEN_AI_BASE_URL && modelName ? modelName : defaultModel;
        console.log(`Using model: ${effectiveModel}`);

        // Construct the target URL using the base URL
        const targetUrl = `${openAIBaseUrl}/chat/completions`;
        console.log("Targeting OpenAI API at:", targetUrl); 

        const response = await fetch(targetUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: effectiveModel, // Use the determined model
                messages: [
                    { role: "system", content: systemPrompt },
                    ...writingSamples,
                    { role: "user", content: aiText },
                ],
                max_tokens: 512,
            }),
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch completion data" }, { status: response.status });
        }

        const data = await response.json();
        console.log("output data: ", data);
        const assistantResponse = data.choices[0]?.message?.content || "No response available";
        console.log("assistantResponse: ", assistantResponse);

        return NextResponse.json({ message: assistantResponse });
    } catch (error) {
        console.error("Error fetching the data:", error);
        return NextResponse.json({ error: "An error occurred while processing your request." }, { status: 500 });
    }
}