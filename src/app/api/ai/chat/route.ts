import { NextResponse } from "next/server";
import { openrouter } from "@/lib/ai/openrouter";
import { buildChatSystemPrompt } from "@/lib/ai/prompts/chat";
import { TopicContext } from "@/lib/ai/context";

export async function POST(request: Request) {
    try {
        // We might receive the old format `{ prompt }` or the new format `{ messages, context }`
        const body = await request.json();
        
        let messages = body.messages || [];
        const context: TopicContext | undefined = body.context;

        // Backward compatibility for old `prompt` style
        if (body.prompt && messages.length === 0) {
            messages = [{ role: 'user', content: body.prompt }];
        }

        if (!messages || messages.length === 0) {
            return NextResponse.json(
                { error: "Messages or prompt is required" },
                { status: 400 }
            );
        }

        // Prepend system prompt if context is provided
        if (context) {
            const systemPrompt = buildChatSystemPrompt(context);
            messages = [
                { role: 'system', content: systemPrompt },
                ...messages
            ];
        } else {
            // Fallback system prompt for backward compatibility
            messages = [
                { role: 'system', content: "You are an expert TNPSC tutor. Explain concepts simply with examples." },
                ...messages
            ];
        }
        
        console.log('\n================ AI GENERATION REQUEST ================');
        console.log(`[API/AI] Sending ${messages.length} messages to OpenRouter.`);

        const completion = await openrouter.chat.completions.create({
            model: "google/gemma-4-26b-a4b-it:free",
            messages: messages
        });
    
        const answer = completion.choices[0]?.message?.content ?? "No response";
        
        console.log('\n[API/AI] Received response from OpenRouter.');
        console.log('=======================================================\n');

        return NextResponse.json({ answer });
    } catch (error) {
        console.error("AI Route Error:", error);

        return NextResponse.json(
            { error: "Failed to generate AI response" },
            { status: 500 }
        );
    }
}