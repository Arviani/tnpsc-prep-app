import { NextResponse } from "next/server";
import { buildChatSystemPrompt } from "@/lib/ai/prompts/chat";
import { TopicContext } from "@/lib/ai/context";
import { ModelManager } from "@/lib/ai/ModelManager";

export async function POST(request: Request) {
    try {
        // We might receive the old format `{ prompt }` or the new format `{ messages, context }`
        const body = await request.json();
        
        let messages = body.messages || [];
        const context: TopicContext | undefined = body.context;
        const requestedModelId = body.modelId;
        const stream = body.stream || false;

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
        console.log(`[API/AI] Sending ${messages.length} messages to ModelManager. Starting model: ${requestedModelId || 'Default'}`);

        const modelManager = ModelManager.getInstance();
        const { response, fallbackInfo, model } = await modelManager.generateChatWithFallback(messages, requestedModelId, stream);
    
        console.log('\n[API/AI] Received response from ModelManager.');
        if (fallbackInfo.wasFallback) {
            console.log(`[API/AI] Fallback triggered! Original: ${fallbackInfo.originalModelId}, New: ${fallbackInfo.newModelId}, Reason: ${fallbackInfo.fallbackReason}`);
        }
        console.log('=======================================================\n');

        if (stream) {
            // Create a TransformStream to parse SSE from OpenRouter and yield raw text
            const encoder = new TextEncoder();
            const decoder = new TextDecoder();
            
            let buffer = '';
            const transformStream = new TransformStream({
              async transform(chunk, controller) {
                buffer += decoder.decode(chunk, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                  const trimmedLine = line.trim();
                  if (trimmedLine.startsWith('data: ') && trimmedLine !== 'data: [DONE]') {
                    try {
                      const data = JSON.parse(trimmedLine.slice(6));
                      const content = data.choices?.[0]?.delta?.content;
                      if (content) {
                        controller.enqueue(encoder.encode(content));
                      }
                    } catch (e) {
                      // ignore parse errors for incomplete chunks
                    }
                  }
                }
              }
            });

            const readable = (response as ReadableStream).pipeThrough(transformStream);

            return new Response(readable, {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'x-fallback-occurred': fallbackInfo.wasFallback ? 'true' : 'false',
                    'x-fallback-reason': fallbackInfo.fallbackReason || '',
                    'x-model-used': model.id
                },
            });
        }

        const answer = (response as any).content ?? "No response";

        return NextResponse.json({ 
            answer, 
            model: model.id,
            fallbackInfo 
        });
    } catch (error) {
        console.error("AI Route Error:", error);

        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to generate AI response" },
            { status: 500 }
        );
    }
}