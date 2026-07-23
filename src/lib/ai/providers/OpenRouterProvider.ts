import { AIProvider, ChatRequest, ChatResponse, ProviderError } from './AIProvider';

export class OpenRouterProvider implements AIProvider {
  get providerType() {
    return 'openrouter';
  }

  private getApiKey(): string {
    return process.env.OPENROUTER_API_KEY || '';
  }

  private handleError(response: Response, data: any): never {
    const error = new Error(data?.error?.message || `API Error: ${response.status}`) as ProviderError;
    error.statusCode = response.status;
    
    const msg = data?.error?.message?.toLowerCase() || '';
    
    // Determine if it's a rate limit issue
    if (response.status === 429 || msg.includes('rate limit')) {
      error.isRateLimit = true;
    }
    
    // Determine if provider is busy
    if (response.status >= 500 || msg.includes('provider busy')) {
      error.isProviderBusy = true;
    }

    // Determine if it's a quota or credits issue
    if (response.status === 402 || msg.includes('credits') || msg.includes('quota')) {
      error.isQuotaExceeded = true;
    }

    // Determine if context window exceeded
    if (response.status === 413 || msg.includes('context') || msg.includes('prompt is too long')) {
      error.isContextTooLarge = true;
    }

    // Determine if max_tokens was too high
    if (msg.includes('max_tokens') || msg.includes('output limit')) {
      error.isOutputLimitExceeded = true;
    }
    
    throw error;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model.providerModelId,
        messages: request.messages,
        stream: false,
        ...(request.maxTokens && { max_tokens: request.maxTokens })
      })
    });

    const data = await response.json();

    if (!response.ok) {
      this.handleError(response, data);
    }

    return {
      content: data.choices[0]?.message?.content || '',
      modelUsed: request.model,
      usage: data.usage
    };
  }

  async chatStream(request: ChatRequest): Promise<ReadableStream> {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model.providerModelId,
        messages: request.messages,
        stream: true,
        ...(request.maxTokens && { max_tokens: request.maxTokens })
      })
    });

    if (!response.ok) {
      let data = {};
      try { data = await response.json(); } catch(e) {}
      this.handleError(response, data);
    }

    if (!response.body) {
      throw new Error('Response body is null, cannot stream');
    }

    return response.body;
  }
}
