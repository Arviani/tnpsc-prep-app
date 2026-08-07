import { FREE_TIER_MODELS } from './models';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class AISecurityGuard {
  
  static validateModel(providerModelId: string): boolean {
    if (!providerModelId.endsWith(':free')) {
      console.warn(`[SECURITY] Blocked non-free model: ${providerModelId}`);
      return false;
    }
    
    const isValid = FREE_TIER_MODELS.some(m => m.providerModelId === providerModelId && m.isEnabled);
    if (!isValid) {
      console.warn(`[SECURITY] Blocked unknown or disabled model: ${providerModelId}`);
      return false;
    }
    
    return true;
  }

  static async estimateCost(promptTokens: number, completionTokens: number): Promise<number> {
    // Since we STRICTLY only allow :free models, the cost is mathematically always 0.
    // If a model somehow slipped through, it would cost money.
    return 0; 
  }

  static enforceTokenLimit(requestType: string, promptLength: number): boolean {
    // Very rough heuristic for tokens (4 chars ~ 1 token)
    const estimatedTokens = Math.ceil(promptLength / 4);
    
    const limits: Record<string, number> = {
      'chat': 1200,
      'study': 2500,
      'examples': 1200,
      'practice': 1000,
      'mcq': 800,
      'flashcards': 600,
      'current_affairs': 1200
    };

    const limit = limits[requestType] || 2000;
    if (estimatedTokens > limit) {
      console.warn(`[SECURITY] Request rejected: Exceeds token limit for ${requestType}. Estimated: ${estimatedTokens}, Limit: ${limit}`);
      return false;
    }

    return true;
  }

  static async logUsage({
    userId,
    model,
    provider,
    requestType,
    promptTokens = 0,
    completionTokens = 0,
    status,
    responseTime
  }: {
    userId: string;
    model: string;
    provider: string;
    requestType: string;
    promptTokens?: number;
    completionTokens?: number;
    status: string;
    responseTime: number;
  }) {
    try {
      await supabase.from('ai_usage').insert({
        user_id: userId,
        model,
        provider,
        request_type: requestType,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens,
        estimated_cost: 0.00, // strict free-tier policy enforcement
        status,
        response_time: responseTime
      });
    } catch (e) {
      console.error('[SECURITY] Failed to log AI usage', e);
    }
  }
}
