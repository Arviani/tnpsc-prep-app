import { generateObject } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { ParserResponseSchema, ParserResponse } from './schemas'
import { SYSTEM_PROMPT, QUESTION_EXTRACTION_PROMPT } from './prompts'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
})

export class GeminiQuestionParser {
  /**
   * Parse a file (PDF or Image) using Gemini Vision natively
   */
  async parseFile(buffer: Buffer, mimeType: string): Promise<ParserResponse> {
    try {
      const { object } = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: ParserResponseSchema,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: QUESTION_EXTRACTION_PROMPT,
              },
              {
                type: 'file',
                data: buffer.toString('base64'),
                mimeType,
              },
            ] as any
          }
        ],
      })
      console.log('Gemini Parsed Object:', JSON.stringify(object, null, 2))
      return object
    } catch (error) {
      console.error('Failed to parse file:', error)
      throw new Error('AI Parsing failed for file')
    }
  }

  /**
   * Parse plain text or markdown content
   */
  async parseText(text: string): Promise<ParserResponse> {
    try {
      const { object } = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: ParserResponseSchema,
        system: SYSTEM_PROMPT,
        prompt: `${QUESTION_EXTRACTION_PROMPT}\\n\\nCONTENT:\\n${text}`,
      })
      return object
    } catch (error) {
      console.error('Failed to parse text:', error)
      throw new Error('AI Parsing failed for text')
    }
  }
}

export const geminiQuestionParser = new GeminiQuestionParser()
