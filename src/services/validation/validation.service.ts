import { ParsedQuestion } from '../parser/schemas'

export interface ValidationError {
  questionIndex: number
  message: string
}

export class ValidationService {
  /**
   * Validates a list of parsed questions and returns any errors found.
   */
  validateParsedQuestions(questions: ParsedQuestion[]): ValidationError[] {
    const errors: ValidationError[] = []
    const seenQuestionNumbers = new Set<number>()
    const seenQuestionTexts = new Set<string>()

    questions.forEach((q, index) => {
      // 1. Empty Question
      if (!q.question || q.question.trim().length < 5) {
        errors.push({
          questionIndex: index,
          message: 'Question text is empty or too short.',
        })
      }

      // 2. Duplicate Question Number
      if (seenQuestionNumbers.has(q.questionNumber)) {
        errors.push({
          questionIndex: index,
          message: `Duplicate question number detected: ${q.questionNumber}.`,
        })
      }
      seenQuestionNumbers.add(q.questionNumber)

      // 3. Duplicate Question Text
      const normalizedText = (q.question || '').toLowerCase().replace(/\s+/g, '')
      if (seenQuestionTexts.has(normalizedText)) {
        errors.push({
          questionIndex: index,
          message: 'Exact duplicate question text detected in this batch.',
        })
      }
      if (normalizedText) {
        seenQuestionTexts.add(normalizedText)
      }

      // 4. Missing Options
      if (!q.options || q.options.length < 2) {
        errors.push({
          questionIndex: index,
          message: `Question must have at least 2 options. Found ${q.options?.length || 0}.`,
        })
      }

      // 5. Invalid/Duplicate Option Labels
      if (q.options) {
        const optionLabels = new Set<string>()
        q.options.forEach((opt) => {
          if (!opt.label || !opt.body.trim()) {
            errors.push({
              questionIndex: index,
              message: 'Found an option with missing label or body text.',
            })
          }
          if (optionLabels.has(opt.label)) {
            errors.push({
              questionIndex: index,
              message: `Duplicate option label '${opt.label}' detected.`,
            })
          }
          optionLabels.add(opt.label)
        })

        // 6. Valid Correct Answer
        if (q.correctAnswer && !optionLabels.has(q.correctAnswer)) {
          errors.push({
            questionIndex: index,
            message: `Correct answer '${q.correctAnswer}' does not match any existing option label.`,
          })
        }
      }
    })

    return errors
  }
}

export const validationService = new ValidationService()
