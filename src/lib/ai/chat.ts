import { openrouter } from "./openrouter";

export async function chat(prompt: string) {
    const completion = await openrouter.chat.completions.create({
        model: "google/gemma-4-26b-a4b-it:free",
        messages: [
            {
                role: "system",
                content: "You are an expert TNPSC tutor. Explain concepts simply with examples."
            },
            {
                role: "user",
                content: prompt
            }
        ]
    });

    return completion.choices[0]?.message?.content ?? "No response";
}