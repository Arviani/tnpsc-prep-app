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

import { FREE_TIER_MODELS } from './models';
import { AISecurityGuard } from './security';

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
        max_tokens: 1200 // Default limit, to be safe
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

    if (!AISecurityGuard.enforceTokenLimit(context.subject, prompt.length)) {
      return { success: false, error: 'Request exceeds token limit.', status: 403 };
    }

    for (let i = 0; i < FREE_TIER_MODELS.length; i++) {
      const modelInfo = FREE_TIER_MODELS[i];
      const model = modelInfo.providerModelId;
      
      if (!AISecurityGuard.validateModel(model)) {
        continue;
      }

      console.log(`${logPrefix} Attempting Free Model: ${model}`);

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

          AISecurityGuard.logUsage({
            userId: 'anonymous', // Replace with real user ID from context when available
            model,
            provider: 'openrouter',
            requestType: context.subject,
            promptTokens: data.usage?.prompt_tokens || 0,
            completionTokens: data.usage?.completion_tokens || 0,
            status: 'success',
            responseTime: duration
          });

          return { success: true, content, modelUsed: model, status: 200 };
        } else if (status === 429) {
          console.warn(`${logPrefix} Rate limit (429) hit on model ${model}. Retrying...`);
          AISecurityGuard.logUsage({
            userId: 'anonymous', model, provider: 'openrouter', requestType: context.subject, status: 'rate_limited', responseTime: duration
          });
        } else {
          console.error(`${logPrefix} API Error on model ${model}:`, data);
          AISecurityGuard.logUsage({
            userId: 'anonymous', model, provider: 'openrouter', requestType: context.subject, status: 'error', responseTime: duration
          });
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
