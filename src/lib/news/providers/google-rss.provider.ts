import { Article, NewsProvider } from '../types';
import Parser from 'rss-parser';
import crypto from 'crypto';

export class GoogleRSSProvider implements NewsProvider {
  name = 'google-rss';
  private parser: Parser;
  private urls: string[];

  constructor() {
    this.parser = new Parser();
    const urlsEnv = process.env.GOOGLE_NEWS_RSS_URLS || 'https://news.google.com/rss/search?q=TNPSC+OR+Tamil+Nadu&hl=en-IN&gl=IN&ceid=IN:en';
    this.urls = urlsEnv.split(/[;,]/).filter(url => url.trim().length > 0);
  }

  async fetchArticles(): Promise<Article[]> {
    if (this.urls.length === 0) {
      console.warn('No Google RSS URLs configured.');
      return [];
    }

    const allArticles: Article[] = [];

    for (const url of this.urls) {
      try {
        const feed = await this.parser.parseURL(url);
        
        for (const item of feed.items) {
          if (!item.title || !item.link) continue;
          
          const id = crypto.createHash('md5').update(item.link).digest('hex');
          
          allArticles.push({
            id,
            title: item.title,
            description: item.contentSnippet || item.content || '',
            content: item.content || '',
            url: item.link,
            source: feed.title || 'Google News RSS',
            publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
            provider: this.name,
          });
        }
      } catch (error) {
        console.error(`Failed to fetch RSS from ${url}:`, error);
      }
    }

    return allArticles;
  }
}
