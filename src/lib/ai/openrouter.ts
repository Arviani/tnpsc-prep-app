import OpenAI from "openai";

export const openrouter = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || 'dummy_key_for_build',
    baseURL: "https://openrouter.ai/api/v1",
});