import { TopicContext } from './context';

export interface AIGenerateOptions {
  prompt: string;
  context: TopicContext;
  requestId?: string;
}

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
  modelUsed?: string;
  status?: number;
}

const MODELS = [
  'google/gemini-2.0-flash-lite-preview-02-05:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'google/gemma-2-9b-it:free'
];

export class AIGenerationService {
  private static async callOpenRouter(prompt: string, model: string): Promise<{ status: number, data: any }> {
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      throw new Error('Missing OPENROUTER_API_KEY');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return { status: response.status, data };
    } catch {
      return { status: response.status, data: text };
    }
  }

  public static async generateContent({ prompt, context, requestId = crypto.randomUUID() }: AIGenerateOptions): Promise<AIResponse> {
    const logPrefix = `[AI GENERATE][${context.currentTab.toUpperCase()}][${requestId}]`;
    console.log(`${logPrefix} Starting generation for Subject: ${context.subject}, Topic: ${context.topic}`);
    console.log(`${logPrefix} Prompt Length: ${prompt.length}`);

    for (let i = 0; i < MODELS.length; i++) {
      const model = MODELS[i];
      console.log(`${logPrefix} Attempting Model: ${model}`);

      try {
        const startTime = Date.now();
        const { status, data } = await this.callOpenRouter(prompt, model);
        const duration = Date.now() - startTime;

        console.log(`${logPrefix} Model ${model} responded in ${duration}ms with status ${status}`);

        if (status === 200 && data.choices && data.choices[0]?.message?.content) {
          console.log(`${logPrefix} Success with model ${model}`);
          
          let content = data.choices[0].message.content;
          
          if (content.startsWith('```json')) {
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();
          } else if (content.startsWith('```')) {
            content = content.replace(/```/g, '').trim();
          }

          return { success: true, content, modelUsed: model, status: 200 };
        } else if (status === 429) {
          console.warn(`${logPrefix} Rate limit (429) hit on model ${model}. Retrying...`);
        } else {
          console.error(`${logPrefix} API Error on model ${model}:`, data);
          if (status >= 500) {
            console.warn(`${logPrefix} Server error (5xx) hit on model ${model}. Retrying...`);
          } else {
            return { success: false, error: `OpenRouter API Error: Status ${status}`, status, modelUsed: model };
          }
        }
      } catch (error: any) {
        console.error(`${logPrefix} Unhandled exception with model ${model}:`, error.message);
      }
    }

    console.error(`${logPrefix} All fallback models failed.`);
    return {
      success: false,
      error: 'All AI models are currently busy. Please try again in a few minutes.',
      status: 429
    };
  }
}
