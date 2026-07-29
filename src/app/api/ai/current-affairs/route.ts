import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const dateStr = searchParams.get('date') || new Date().toISOString()
    const targetDate = new Date(dateStr)
    const formattedDate = targetDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: z.object({
        date: z.string(),
        articles: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            category: z.string(),
            source: z.string(),
            directFact: z.string(),
            keySpecifics: z.array(z.string()),
            examLens: z.string(),
          })
        )
      }),
      prompt: `You are an expert TNPSC exam preparation assistant. 
      Generate 6 highly relevant current affairs articles for the date: ${formattedDate}.
      These must be realistic news items that would be important for TNPSC Group 1, 2, and 4 exams (focus on Tamil Nadu state news, India national news, and significant international news).
      
      For each article:
      - Provide a short, punchy title.
      - Assign a category (e.g., "State", "National", "International", "Economy", "Science & Tech", "Sports").
      - Provide a realistic source (e.g., "The Hindu - National").
      - "directFact": A concise 1-2 sentence summary of the news.
      - "keySpecifics": 3-5 bullet points detailing the important facts, numbers, dates, or names.
      - "examLens": A single sentence explaining why this is important for TNPSC exams and what specific detail might be asked.
      
      Make the content highly accurate, educational, and realistic.`,
    })

    return NextResponse.json(object)
  } catch (error: any) {
    console.error('Error generating current affairs:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
