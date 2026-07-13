import { z } from 'zod'

export const OptionSchema = z.object({
  label: z.enum(['A', 'B', 'C', 'D', 'E']),
  body: z.string(),
})

export type Option = z.infer<typeof OptionSchema>

export const ParsedQuestionSchema = z.object({
  questionNumber: z.number(),
  question: z.string(),
  options: z.array(OptionSchema),
  correctAnswer: z.string().optional().nullable(),
  explanation: z.string().optional().nullable(),
  exam: z.string().optional().nullable(),
  year: z.number().optional().nullable(),
  language: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  chapter: z.string().optional().nullable(),
  section: z.string().optional().nullable(),
  topic: z.string().optional().nullable(),
  marks: z.number().optional().nullable(),
})

export type ParsedQuestion = z.infer<typeof ParsedQuestionSchema>

export const ParserResponseSchema = z.object({
  questions: z.array(ParsedQuestionSchema),
  paperMetadata: z.object({
    exam: z.string().optional().nullable(),
    year: z.number().optional().nullable(),
    section: z.string().optional().nullable(),
    language: z.string().optional().nullable(),
    totalQuestions: z.number().optional().nullable(),
    totalMarks: z.number().optional().nullable(),
  }).optional().nullable(),
})

export type ParserResponse = z.infer<typeof ParserResponseSchema>
