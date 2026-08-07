import { Article, AIGeneratedContent } from './types';
import { ModelManager } from '../ai/ModelManager';
import { ChatMessage } from '../ai/providers/AIProvider';

export class Generator {
  static async generateContent(article: Article): Promise<AIGeneratedContent | null> {
    const prompt = `You are an expert TNPSC content creator. Analyze the following news article and generate structured content for students.
    
Article Title: ${article.title}
Article Content: ${article.content || article.description}

You must return ONLY a raw JSON object with the following exact structure. Do not use markdown blocks, just the JSON string.
{
  "isRelevant": true,
  "headline": "A clear, concise, exam-focused headline",
  "summary": "A 3-line summary of the news.",
  "keyFacts": ["Fact 1", "Fact 2", "Fact 3"],
  "tnpscSubject": "E.g., Indian Polity, Current Affairs, Geography",
  "difficulty": "Easy | Medium | Hard",
  "importantDates": [{"date": "YYYY-MM-DD", "description": "What happened"}],
  "importantNumbers": [{"number": "e.g., 500 Crore", "description": "Budget allocation"}],
  "keywords": ["keyword1", "keyword2"],
  "revisionNotes": "A short paragraph for quick revision.",
  "mcqs": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact matching string from options",
      "explanation": "Why this is correct"
    }
  ]
}
Ensure exactly 5 MCQs are provided in the mcqs array.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are an AI assistant that only outputs strictly valid JSON.' },
      { role: 'user', content: prompt }
    ];

    try {
      const modelManager = ModelManager.getInstance();
      const { response } = await modelManager.generateChatWithFallback(messages, undefined, false);
      
      let rawOutput = (response as any).content?.trim() || '';
      
      // Clean up potential markdown formatting that models sometimes inject
      if (rawOutput.startsWith('\`\`\`json')) {
        rawOutput = rawOutput.replace(/^\`\`\`json/m, '').replace(/\`\`\`$/m, '').trim();
      } else if (rawOutput.startsWith('\`\`\`')) {
        rawOutput = rawOutput.replace(/^\`\`\`/m, '').replace(/\`\`\`$/m, '').trim();
      }

      const parsed = JSON.parse(rawOutput) as AIGeneratedContent;
      return parsed;
    } catch (error) {
      console.error(`Generation failed for article ${article.id}:`, error);
      return null;
    }
  }
}
