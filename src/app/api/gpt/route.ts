import { NextResponse } from 'next/server';
import { systemPrompt } from '../humanaize/utils/instr';
import { writingSamples } from '../humanaize/utils/samples';

// Read required config from environment variables
// NOTE: Consider removing NEXT_PUBLIC_ prefix if key is only used server-side
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const openAIBaseUrl = process.env.OPEN_AI_BASE_URL;
const modelName = process.env.MODEL_NAME;

export async function POST(request: Request) {
    // --- Configuration Check ---
    if (!apiKey || !openAIBaseUrl || !modelName) {
        console.error("API Error: Missing required environment variables (API Key, Base URL, or Model Name).");
        return NextResponse.json(
            { error: "Server configuration error. Required API settings are missing." },
            { status: 500 }
        );
    }

    try {
        console.log("=====================================");
        console.log("POST /api/gpt");
        const { aiText } = await request.json();
        console.log("User text: ", aiText);

        // Use environment variables directly
        console.log(`Using model: ${modelName}`);
        const targetUrl = `${openAIBaseUrl}/chat/completions`;
        console.log("Targeting API at:", targetUrl);

        const response = await fetch(targetUrl, {
            method: "POST",
            headers: {
                // Use the appropriate Authorization header for your endpoint
                // This might be 'Authorization': `Bearer ${apiKey}` or something else
                // depending on the specific API (OpenRouter, OpenAI, etc.)
                'Authorization': `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: modelName, // Use the required model name
                messages: [
                    { role: "system", content: systemPrompt },
                    ...writingSamples,
                    { role: "user", content: aiText },
                ],
                // Add any other parameters required by the specific model/endpoint
                // stream: false, // Example: uncomment if needed
                max_tokens: 512,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API Error (${response.status}): ${errorBody}`);
            return NextResponse.json(
                { error: `Failed to fetch completion data from the upstream API. Status: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log("output data: ", data);
        // Adjust response parsing based on the actual API output structure
        const assistantResponse = data.choices?.[0]?.message?.content || "No response available";
        console.log("assistantResponse: ", assistantResponse);

        return NextResponse.json({ message: assistantResponse });
    } catch (error: any) {
        console.error("Internal Server Error:", error);
        return NextResponse.json(
            { error: `An internal error occurred: ${error.message}` },
            { status: 500 }
        );
    }
}