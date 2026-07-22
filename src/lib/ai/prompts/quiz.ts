import { TopicContext } from '../context';

export type QuizAction = 
  | 'strengths' 
  | 'weak_areas' 
  | 'speed' 
  | 'topic_analysis' 
  | 'study_plan';

export interface QuizData {
  score: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  accuracyPercentage: number;
  correctTopics: string[];
  incorrectTopics: string[];
}

export function buildQuizPrompt(
  context: TopicContext,
  quizData: QuizData,
  action: QuizAction
): string {
  const baseContext = `The student has completed a quiz.\nScore: ${quizData.score}/${quizData.totalQuestions} (${quizData.accuracyPercentage}%)\nTime Spent: ${Math.floor(quizData.timeSpentSeconds / 60)}m ${quizData.timeSpentSeconds % 60}s\nStrong Areas: ${quizData.correctTopics.join(', ')}\nWeak Areas: ${quizData.incorrectTopics.join(', ')}\n\nTask:\n`;

  switch (action) {
    case 'strengths':
      return baseContext + "Identify the student's specific strengths based on their correct topics and praise them encouragingly.";
    case 'weak_areas':
      return baseContext + "Identify the student's weak areas based on their incorrect topics. Suggest exactly which sub-topics they need to revise.";
    case 'speed':
      return baseContext + "Analyze their time spent. If they are too slow, give tips on improving speed. If they are fast but inaccurate, advise them on reading questions carefully.";
    case 'topic_analysis':
      return baseContext + "Provide a detailed breakdown of how they performed across different sub-topics within this chapter.";
    case 'study_plan':
      return baseContext + "Create a quick 7-day revision plan focusing primarily on improving their weak areas while maintaining their strengths.";
    default:
      return baseContext + "Provide a helpful summary of their quiz performance.";
  }
}
