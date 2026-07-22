import { TopicContext } from '../context';

export function buildExamplesPrompt(context: TopicContext): string {
  return `Generate 3 high-quality Worked Examples for this topic.

Requirements:
- Each example should have a clear Question.
- Provide a Step-by-Step Solution.
- Include a brief Explanation of the logic or shortcut used.
- Ensure the examples vary slightly in difficulty (Easy, Medium, Hard).
- Return EXACTLY as a JSON array of objects with this structure:
[
  {
    "question_text": "...",
    "step_by_step_solution": "...",
    "explanation": "..."
  }
]
- Do NOT wrap in markdown, return raw JSON.`;
}

export type ExampleAction = 'explain_simply' | 'similar_example' | 'identify_tricks';

export function buildExampleActionPrompt(
  context: TopicContext,
  question: string,
  solution: string,
  action: ExampleAction
): string {
  const baseContext = `The student is looking at a worked example.\n\nQuestion: "${question}"\nSolution: "${solution}"\n\nTask: `;
  
  if (action === 'explain_simply') {
    return baseContext + 'Explain this solution in very simple terms, as if explaining to a beginner.';
  } else if (action === 'similar_example') {
    return baseContext + 'Provide one similar example question and solve it step-by-step so the student can see another instance of this concept.';
  } else if (action === 'identify_tricks') {
    return baseContext + 'Identify any shortcuts or tricks that can be used to solve this specific type of question faster in an exam.';
  }
  return baseContext + 'Provide a helpful explanation.';
}
