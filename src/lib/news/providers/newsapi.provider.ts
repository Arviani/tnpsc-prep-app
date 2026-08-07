import { Article, NewsProvider } from '../types';
import crypto from 'crypto';

export class NewsAPIProvider implements NewsProvider {
  name = 'newsapi';
  private apiKey: string;
  private endpoint = 'https://newsapi.org/v2/top-headlines';

  constructor() {
    this.apiKey = process.env.NEWSAPI_KEY || '';
  }

  async fetchArticles(): Promise<Article[]> {
    if (!this.apiKey) {
      console.warn('NEWSAPI_KEY not configured.');
      return [];
    }

    try {
      // We can fetch India top headlines for example, or specific categories
      const url = `${this.endpoint}?country=in&apiKey=${this.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`NewsAPI responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'ok' || !data.articles) {
        return [];
      }

      return data.articles.map((item: any) => {
        const id = crypto.createHash('md5').update(item.url || item.title).digest('hex');
        
        return {
          id,
          title: item.title || '',
          description: item.description || '',
          content: item.content || '',
          url: item.url || '',
          source: item.source?.name || 'NewsAPI',
          publishedAt: new Date(item.publishedAt),
          image: item.urlToImage,
          provider: this.name,
        } as Article;
      }).filter((article: Article) => article.title && article.url);

    } catch (error) {
      console.error(`Failed to fetch from NewsAPI:`, error);
      return [];
    }
  }
}
