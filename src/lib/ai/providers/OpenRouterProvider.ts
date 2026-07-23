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
    
    // Determine if it's a rate limit or quota issue
    if (response.status === 429 || data?.error?.message?.toLowerCase().includes('rate limit')) {
      error.isRateLimit = true;
    }
    
    // Determine if provider is busy
    if (response.status >= 500 || data?.error?.message?.toLowerCase().includes('provider busy')) {
      error.isProviderBusy = true;
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
        stream: false
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
        stream: true
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
