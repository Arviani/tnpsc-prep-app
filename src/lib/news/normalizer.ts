import { Article } from './types';

export class Normalizer {
  static normalize(articles: Article[]): Article[] {
    return articles.map(article => {
      // Clean up text
      const title = this.cleanText(article.title);
      const description = this.cleanText(article.description);
      const content = this.cleanText(article.content);

      return {
        ...article,
        title,
        description,
        content,
      };
    });
  }

  private static cleanText(text: string): string {
    if (!text) return '';
    
    // Remove HTML tags
    let cleaned = text.replace(/<[^>]*>?/gm, '');
    
    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }
}
