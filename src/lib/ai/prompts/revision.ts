import { TopicContext } from '../context';

export type RevisionAction = 
  | 'summary'
  | 'bullet_notes'
  | 'revision_sheet'
  | 'flashcards'
  | 'memory_tricks'
  | 'exam_tips';

export function buildRevisionPrompt(
  context: TopicContext,
  existingNotes?: string,
  action?: RevisionAction
): string {
  let prompt = ``;

  if (existingNotes && existingNotes.trim().length > 0) {
    prompt += `Reference Notes:\n"""\n${existingNotes.substring(0, 2000)}...\n"""\n`;
  }

  switch (action) {
    case 'summary':
      prompt += `Provide a high-level summary of the most important concepts from this topic.`;
      break;
    case 'bullet_notes':
      prompt += `Generate highly concise, point-by-point bullet notes designed for rapid revision.`;
      break;
    case 'revision_sheet':
      prompt += `Create a structured one-page revision sheet containing key formulas, dates, facts, or concepts.`;
      break;
    case 'flashcards':
      prompt += `Create 5 quick flashcards (Question & Answer format) testing the core facts of this topic.`;
      break;
    case 'memory_tricks':
      prompt += `Provide mnemonics or memory tricks to help memorize the difficult parts of this topic.`;
      break;
    case 'exam_tips':
      prompt += `What are the top 3 exam tips or common traps to avoid for this specific topic?`;
      break;
    default:
      prompt += `Generate a comprehensive revision guide for this topic.`;
  }

  return prompt;
}
