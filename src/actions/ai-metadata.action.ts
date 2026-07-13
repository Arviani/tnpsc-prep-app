'use server'

import { generateObject, generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { z } from 'zod'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
})

export async function generateQuestionMetadataAction(
  questionBody: string,
  options: { label: string; body: string }[],
  type: 'subject' | 'chapter' | 'topic' | 'difficulty' | 'explanation' | 'keywords'
) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('API key missing')
  }

  const context = `Question: ${questionBody}\nOptions:\n${options.map(o => `${o.label}: ${o.body}`).join('\n')}`

  try {
    if (type === 'explanation') {
      const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        system: 'You are an expert TNPSC teacher. Write a highly accurate, clear, and concise explanation (max 3 sentences) for this multiple-choice question. Do not just state the correct answer, explain WHY it is correct.',
        prompt: context,
      })
      return text
    }

    if (type === 'keywords') {
      const { object } = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: z.object({ keywords: z.array(z.string()) }),
        system: 'Extract 3-5 relevant SEO and search keywords for this TNPSC question. Return only a JSON array of strings.',
        prompt: context,
      })
      return object.keywords.join(', ')
    }

    // For short single-string fields
    const prompts = {
      subject: 'Classify this TNPSC question into a primary subject (e.g., History, Geography, Indian Polity, General Tamil, Aptitude). Return exactly one short phrase.',
      chapter: 'What is the standard textbook chapter name for this TNPSC question? (e.g., Indus Valley Civilization, Fundamental Rights). Return exactly one short phrase.',
      topic: 'What is the specific micro-topic for this TNPSC question? Return exactly one short phrase.',
      difficulty: 'Classify the difficulty of this TNPSC question as strictly one of: Easy, Medium, or Hard.'
    }

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: 'You are a TNPSC classification AI. Follow the prompt strictly and output ONLY the requested string, no markdown, no quotes.',
      prompt: `${prompts[type]}\n\n${context}`,
    })

    return text.trim()
  } catch (e) {
    console.error(`AI Generation failed for ${type}:`, e)
    throw new Error(`Failed to generate ${type}`)
  }
}
