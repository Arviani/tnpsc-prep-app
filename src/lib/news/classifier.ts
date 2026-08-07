import { Article } from './types';
import { ModelManager } from '../ai/ModelManager';
import { ChatMessage } from '../ai/providers/AIProvider';

export class Classifier {
  static async isRelevantToTNPSC(article: Article): Promise<boolean> {
    const prompt = `You are a strict classifier for a TNPSC (Tamil Nadu Public Service Commission) exam preparation platform.
Determine if the following news article is RELEVANT or NOT RELEVANT for TNPSC exam preparation.
Relevant categories include: Government Schemes, Economy, Science, Technology, Environment, Geography, History, Awards, Sports, International Relations, Tamil Nadu state news, Indian Polity, Agriculture, Education, Health.
Discard: Entertainment, Celebrity News, Crime, Gossip, Movie Releases, highly partisan politics without exam relevance.

Article Title: ${article.title}
Article Description: ${article.description}

Respond with ONLY the word "RELEVANT" or "NOT_RELEVANT". Do not provide any explanation.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are a strict and accurate classification AI.' },
      { role: 'user', content: prompt }
    ];

    try {
      const modelManager = ModelManager.getInstance();
      // Try using a faster model for classification if you have one, or just let ModelManager decide
      const { response } = await modelManager.generateChatWithFallback(messages, undefined, false);
      
      const content = (response as any).content?.trim().toUpperCase() || '';
      return content.includes('RELEVANT') && !content.includes('NOT_RELEVANT');
    } catch (error) {
      console.error(`Classification failed for article ${article.id}:`, error);
      // In case of error, conservatively mark as false or true depending on strategy. We'll say false to avoid spam.
      return false;
    }
  }
}
