import { TopicContext } from '../context';

export type StudyAction = 
  | 'explain_simply' 
  | 'explain_detail' 
  | 'real_life_example' 
  | 'exam_points' 
  | 'memory_tricks' 
  | 'mnemonics'
  | 'revision_notes'
  | 'flashcards'
  | 'explain_tamil';

export function buildStudyPrompt(
  context: TopicContext,
  action: StudyAction,
  existingContent?: string
): string {
  let prompt = ``;

  if (existingContent && existingContent.trim().length > 0) {
    prompt += `Reference Material (use this as the base text for your answer if relevant):\n"""\n${existingContent.substring(0, 2000)}...\n"""\n`;
  }

  switch (action) {
    case 'explain_simply':
      prompt += `Explain this topic's core concept as simply as possible, avoiding jargon. Keep it under 3 paragraphs.`;
      break;
    case 'explain_detail':
      prompt += `Generate a PREMIUM, COMPREHENSIVE interactive study lesson for this topic. 
You are a Principal TNPSC Faculty Member. Teach clearly, simply, and effectively. Avoid academic jargon.

CRITICAL INSTRUCTIONS:
- LENGTH: The lesson must be incredibly detailed (2500-5000 words), targeting 8-15 minutes of reading time. NEVER summarize. NEVER shorten. Continue until every section is thoroughly completed.
- NO RAW MARKDOWN SYMBOLS: Use the specific blockquote syntax below to render rich UI components.
- EXAMPLES: You MUST include at least 10 solved examples across Easy, Medium, and Hard difficulties.

REQUIRED SECTIONS (You must include ALL of these in order):
1. Introduction
2. Why this topic is important in TNPSC (Expected Marks, Frequency)
3. Learning Objectives
4. Prerequisites
5. Core Concepts
6. Concept Breakdown (Explain one concept at a time)
7. Visual Explanation Suggestions (Use markdown tables, comparison grids, or step flows)
8. Shortcut Tricks
9. Memory Techniques
10. Exam Tips
11. Worked Examples (Minimum 10 solved examples. Each must include: Question, Thinking Process, Step-by-step Solution, Shortcut, Common Mistake, Exam Tip)
12. Common Mistakes & Traps
13. Previous Year TNPSC Pattern Analysis
14. Frequently Asked Questions
15. Practice Exercises (Just the questions)
16. Summary
17. Revision Sheet
18. Flashcards
19. Quick Revision Table
20. What to study next

UI COMPONENT SYNTAX:
To render beautiful UI cards, you MUST use exactly these blockquote prefixes. NEVER use standard blockquotes without a prefix.

For Tips:
> 💡 **TIP:** [Your tip here]

For Warnings/Traps:
> ⚠️ **WARNING:** [Your warning here]

For Info/Important Notes:
> ℹ️ **INFO:** [Your info here]

For Formulas/Equations:
> 📐 **FORMULA:** [Your formula here]

For Examples:
> 📝 **EXAMPLE:** 
> **Question:** [Question]
> **Thinking:** [Thinking Process]
> **Solution:** [Step-by-step]
> **Shortcut:** [Shortcut]

For Practice Questions:
> ❓ **QUESTION:** [Question text]

For layout, use Markdown Tables extensively instead of paragraphs where comparing things or listing properties. Use standard Markdown headings (H1, H2, H3) to structure the document.`;
      break;
    case 'real_life_example':
      prompt += `Provide 2 to 3 relatable, real-life examples illustrating the concepts in this topic.`;
      break;
    case 'exam_points':
      prompt += `Extract and highlight the most crucial points from this topic that are highly likely to be tested in TNPSC exams. Format as bullet points.`;
      break;
    case 'memory_tricks':
      prompt += `Creative memory tricks or mental associations to help remember the key facts from this topic easily.`;
      break;
    case 'mnemonics':
      prompt += `Easy-to-remember mnemonics or acronyms for the lists, sequences, or key facts presented in this topic.`;
      break;
    case 'revision_notes':
      prompt += `Concise, high-yield bullet notes for quick revision before the exam.`;
      break;
    case 'flashcards':
      prompt += `5 question-and-answer flashcards based on the most important facts in this topic. Format clearly as "Q: ..." and "A: ...".`;
      break;
    case 'explain_tamil':
      prompt += `Explain the core concepts of this topic in clear, conversational Tamil. Use English terms in brackets for technical words.`;
      break;
    default:
      prompt += `Provide a helpful summary of this topic.`;
  }

  return prompt;
}
