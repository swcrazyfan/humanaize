import { NextResponse } from 'next/server';
import { systemPrompt } from '../humanaize/utils/instr';
import { writingSamples } from '../humanaize/utils/samples';

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const openAIBaseUrl = process.env.OPEN_AI_BASE_URL || "https://api.openai.com/v1";

export async function POST(request: Request) {
    try {
        console.log("=====================================");
        console.log("POST /api/gpt");
        const { aiText } = await request.json();
        console.log("User text: ", aiText);

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
                model: "gpt-4o",
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