import { Article } from './types';

export class Deduplicator {
  /**
   * Filters out duplicate articles from a batch.
   * Simple implementation: exact title or URL matches.
   * In a real production system, this could use fuzzy matching or embedding distance.
   */
  static deduplicate(articles: Article[]): Article[] {
    const uniqueMap = new Map<string, Article>();

    for (const article of articles) {
      // Create a unique key based on URL or title (lower cased and stripped of spaces)
      const urlKey = article.url || '';
      const titleKey = article.title.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Check if we already have it
      if (urlKey && uniqueMap.has(`url_${urlKey}`)) {
        continue;
      }
      
      if (titleKey && uniqueMap.has(`title_${titleKey}`)) {
        continue;
      }

      uniqueMap.set(`url_${urlKey}`, article);
      uniqueMap.set(`title_${titleKey}`, article);
      
      // Also keep a master list by ID to ensure we don't return duplicates
      uniqueMap.set(`id_${article.id}`, article);
    }

    // Extract unique articles
    const result = new Map<string, Article>();
    uniqueMap.forEach((article) => {
      result.set(article.id, article);
    });

    return Array.from(result.values());
  }
}
