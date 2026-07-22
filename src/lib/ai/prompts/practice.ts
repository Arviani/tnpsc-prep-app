import { TopicContext } from '../context';

export type PracticeAction = 
  | 'why_wrong' 
  | 'explain_concept' 
  | 'shortcut' 
  | 'similar_question' 
  | 'common_mistakes' 
  | 'difficulty_analysis';

export function buildPracticeGeneratePrompt(context: TopicContext): string {
  return `Generate 5 TNPSC-style multiple choice practice questions.
Subject: ${context.subject}
Topic: ${context.topic}
Difficulty: ${context.difficulty}

CRITICAL INSTRUCTION:
- You MUST ONLY generate questions related to the Topic "${context.topic}" within the Subject "${context.subject}".
- DO NOT generate questions from another subject or unrelated topics. 
- DO NOT generate history questions for a reasoning topic.
- Return the response EXACTLY as a JSON array of objects with this structure:
[
  {
    "body": "Question text here?",
    "options": [
      { "body": "Option A", "is_correct": true },
      { "body": "Option B", "is_correct": false },
      { "body": "Option C", "is_correct": false },
      { "body": "Option D", "is_correct": false }
    ]
  }
]
- Do NOT wrap the JSON in markdown code blocks, just return the raw JSON array.`;
}

export function buildPracticePrompt(
  context: TopicContext,
  question: string,
  options: string[],
  studentAnswer: string,
  correctAnswer: string,
  action: PracticeAction
): string {
  const baseContext = `The student just practiced a question.\n\nQuestion:\n"${question}"\n\nOptions:\n- ${options.join('\n- ')}\n\nStudent's Answer: "${studentAnswer}"\nCorrect Answer: "${correctAnswer}"\n\nTask:\n`;

  switch (action) {
    case 'why_wrong':
      return baseContext + "The student chose the wrong answer. Gently explain specifically why their chosen answer is incorrect, and then explain why the correct answer is right. Do not make them feel bad.";
    case 'explain_concept':
      return baseContext + "Explain the underlying concept or theory behind this question so the student can understand it deeply and answer similar questions correctly in the future.";
    case 'shortcut':
      return baseContext + "Provide a shortcut, trick, or faster method to arrive at the correct answer for this specific type of question to save time in the exam.";
    case 'similar_question':
      return baseContext + "Generate one new, similar practice question based on the same concept. Provide the options, and then provide the correct answer with a brief explanation.";
    case 'common_mistakes':
      return baseContext + "What are the common traps or mistakes students make when trying to solve this type of question? How can the student avoid them?";
    case 'difficulty_analysis':
      return baseContext + "Analyze the difficulty of this question for a TNPSC aspirant. What makes it tricky? Is it a factual recall or application-based question?";
    default:
      return baseContext + "Provide a helpful explanation for this question.";
  }
}
