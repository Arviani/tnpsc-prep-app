import { createClient } from '../supabase/server';
import { NewsAPIProvider } from './providers/newsapi.provider';
import { GoogleRSSProvider } from './providers/google-rss.provider';
import { TheHinduProvider } from './providers/the-hindu.provider';
import { TimesOfIndiaProvider } from './providers/times-of-india.provider';
import { RSS_CONFIG } from '../../config/rss.config';
import { Normalizer } from './normalizer';
import { Deduplicator } from './deduplicator';
import { Classifier } from './classifier';
import { Generator } from './generator';
import { Article, AIGeneratedContent } from './types';

export class NewsService {
  static async runDailyIngestion(enabledProviders?: string[]) {
    const supabase = await createClient();
    
    // 1. Initialize Providers dynamically based on config
    const providers = [];
    
    // Determine which are enabled either globally in config or via passed params
    const isEnabled = (id: string) => {
      if (enabledProviders) return enabledProviders.includes(id);
      const conf = RSS_CONFIG.find(c => c.id === id);
      return conf ? conf.enabled : false;
    };

    if (isEnabled('newsapi')) providers.push(new NewsAPIProvider());
    if (isEnabled('google-rss')) providers.push(new GoogleRSSProvider());
    if (isEnabled('the-hindu')) providers.push(new TheHinduProvider());
    if (isEnabled('times-of-india')) providers.push(new TimesOfIndiaProvider());

    // 2. Fetch Articles
    let rawArticles: Article[] = [];
    for (const provider of providers) {
      try {
        const articles = await provider.fetchArticles();
        rawArticles.push(...articles);
      } catch (error) {
        console.error(`Error fetching from provider ${provider.name}:`, error);
      }
    }

    // 3. Normalize
    const normalized = Normalizer.normalize(rawArticles);

    // 4. Deduplicate
    const uniqueArticles = Deduplicator.deduplicate(normalized);

    console.log(`Fetched ${rawArticles.length} raw articles. Deduplicated to ${uniqueArticles.length}.`);

    let processedCount = 0;

    // 5. Process each article (Take up to 3 per provider to ensure diversity)
    const articlesToProcess: Article[] = [];
    const providerGroups = uniqueArticles.reduce((acc, article) => {
      if (!acc[article.provider]) acc[article.provider] = [];
      acc[article.provider].push(article);
      return acc;
    }, {} as Record<string, Article[]>);
    
    for (const provider of Object.keys(providerGroups)) {
      articlesToProcess.push(...providerGroups[provider].slice(0, 3));
    }
    for (const article of articlesToProcess) {
      try {
        // Check if we already have this URL in the DB to prevent duplicate processing
        const { data: existing } = await supabase
          .from('current_affairs')
          .select('id')
          .eq('source_url', article.url)
          .single();
          
        if (existing) {
          console.log(`Skipping already ingested article: ${article.title}`);
          continue;
        }

        // 6. Classification
        const isRelevant = await Classifier.isRelevantToTNPSC(article);
        if (!isRelevant) {
          console.log(`Skipping irrelevant article: ${article.title}`);
          continue;
        }

        // 7. Generation
        const generated = await Generator.generateContent(article);
        if (!generated || !generated.isRelevant) {
           console.log(`Generation failed or marked irrelevant by generator: ${article.title}`);
           continue;
        }

        // 8. Save to Supabase
        await this.saveToDatabase(supabase, article, generated);
        processedCount++;

      } catch (error) {
        console.error(`Error processing article ${article.title}:`, error);
      }
    }

    console.log(`Ingestion complete. Processed ${processedCount} new articles.`);
    return { success: true, processed: processedCount };
  }

  private static async saveToDatabase(supabase: any, article: Article, content: AIGeneratedContent) {
    // Insert main record
    const { data: ca, error: caError } = await supabase
      .from('current_affairs')
      .insert({
        headline: content.headline || article.title,
        summary: content.summary || article.description,
        key_facts: content.keyFacts || [],
        revision_notes: content.revisionNotes,
        tnpsc_subject: content.tnpscSubject,
        difficulty: content.difficulty,
        important_dates: content.importantDates || [],
        important_numbers: content.importantNumbers || [],
        category: article.category || 'General',
        published_date: article.publishedAt,
        source_url: article.url,
        provider: article.provider,
        status: 'published',
        ai_metadata: { processed_at: new Date().toISOString() }
      })
      .select()
      .single();

    if (caError || !ca) {
      throw new Error(`Failed to insert current_affairs: ${caError?.message}`);
    }

    // Insert questions
    if (content.mcqs && content.mcqs.length > 0) {
      const questionsToInsert = content.mcqs.map(mcq => ({
        current_affair_id: ca.id,
        question_text: mcq.question,
        options: mcq.options,
        correct_answer: mcq.correctAnswer,
        explanation: mcq.explanation
      }));

      const { error: qError } = await supabase
        .from('current_affair_questions')
        .insert(questionsToInsert);
        
      if (qError) console.error('Failed to insert questions:', qError.message);
    }

    // Insert keywords
    if (content.keywords && content.keywords.length > 0) {
      const keywordsToInsert = content.keywords.map(kw => ({
        current_affair_id: ca.id,
        keyword: kw
      }));

      const { error: kError } = await supabase
        .from('current_affair_keywords')
        .insert(keywordsToInsert);
        
      if (kError) console.error('Failed to insert keywords:', kError.message);
    }
  }
}
