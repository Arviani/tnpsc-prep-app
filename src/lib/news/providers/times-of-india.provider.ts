import { Article, NewsProvider } from '../types';
import Parser from 'rss-parser';
import crypto from 'crypto';
import { RSS_CONFIG } from '../../../config/rss.config';

export class TimesOfIndiaProvider implements NewsProvider {
  name = 'times-of-india';
  private parser: Parser;
  private urls: string[];

  constructor() {
    this.parser = new Parser();
    const config = RSS_CONFIG.find(c => c.id === this.name);
    this.urls = config && config.enabled ? config.urls : [];
  }

  async fetchArticles(): Promise<Article[]> {
    if (this.urls.length === 0) {
      return [];
    }

    const rawArticles = await this.fetchNews();
    const normalized = this.normalize(rawArticles);
    return this.validate(normalized);
  }

  private async fetchNews(): Promise<any[]> {
    const rawItems: any[] = [];
    for (const url of this.urls) {
      try {
        const feed = await this.parser.parseURL(url);
        for (const item of feed.items) {
          rawItems.push({ ...item, feedTitle: feed.title });
        }
      } catch (error) {
        console.error(`Failed to fetch RSS from ${url}:`, error);
      }
    }
    return rawItems;
  }

  private normalize(rawItems: any[]): Article[] {
    const articles: Article[] = [];
    for (const item of rawItems) {
      if (!item.title || !item.link) continue;
      
      const id = crypto.createHash('md5').update(item.link).digest('hex');
      
      articles.push({
        id,
        title: item.title,
        description: item.contentSnippet || item.content || '',
        content: item.content || '',
        url: item.link,
        source: item.feedTitle || 'Times of India',
        publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
        provider: this.name,
      });
    }
    return articles;
  }

  private validate(articles: Article[]): Article[] {
    // Ensure all required fields are present and valid
    return articles.filter(a => a.title && a.url && !isNaN(a.publishedAt.getTime()));
  }
}
