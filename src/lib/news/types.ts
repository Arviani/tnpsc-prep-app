export interface Article {
  id: string; // Unique hash or URL
  title: string;
  description: string;
  content: string;
  url: string;
  source: string;
  publishedAt: Date;
  image?: string;
  provider: string; // e.g. 'newsapi', 'google-rss'
  category?: string;
}

export interface NewsProvider {
  name: string;
  fetchArticles(): Promise<Article[]>;
}

export interface MCQ {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface AIGeneratedContent {
  isRelevant: boolean;
  headline?: string;
  summary?: string;
  keyFacts?: string[];
  tnpscSubject?: string;
  difficulty?: string;
  importantDates?: { date: string; description: string }[];
  importantNumbers?: { number: string; description: string }[];
  mcqs?: MCQ[];
  keywords?: string[];
  revisionNotes?: string;
}
