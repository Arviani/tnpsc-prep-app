import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const maxDuration = 60

const parser = new Parser()
// Public news feed from The Hindu
const RSS_FEED_URL = 'https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss'

export async function POST(req: Request) {
  try {
    // 1. Fetch RSS Feed
    const feed = await parser.parseURL(RSS_FEED_URL)
    const topItems = feed.items.slice(0, 8) // Get top 8 news items to stay within context limits

    if (!topItems.length) {
      return NextResponse.json({ error: 'No news found in RSS feed' }, { status: 400 })
    }

    const rawNewsStr = topItems.map(item => `Title: ${item.title}\nContent: ${item.contentSnippet}`).join('\n\n')

    // 2. Process with AI
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: z.object({
        articles: z.array(
          z.object({
            title: z.string(),
            category: z.string(),
            source: z.string(),
            direct_fact: z.string(),
            key_specifics: z.array(z.string()),
            exam_lens: z.string(),
          })
        )
      }),
      prompt: `You are an expert TNPSC exam preparation assistant.
      I have scraped the latest news headlines from The Hindu (Tamil Nadu/National).
      Analyze these raw news snippets and extract 5 highly relevant current affairs articles for TNPSC Group 1, 2, and 4 exams.
      
      Raw News:
      ${rawNewsStr}
      
      For each extracted article:
      - Provide a short, punchy title.
      - Assign a category (e.g., "State", "National", "International", "Economy", "Science & Tech", "Sports").
      - Provide a realistic source (e.g., "The Hindu - Tamil Nadu").
      - "direct_fact": A concise 1-2 sentence summary of the news.
      - "key_specifics": 3-5 bullet points detailing the important facts, numbers, dates, or names.
      - "exam_lens": A single sentence explaining why this is important for TNPSC exams and what specific detail might be asked.
      
      Make the content highly accurate and educational. Ignore generic or irrelevant news (e.g. gossip, minor local crime).`,
    })

    if (!object.articles.length) {
       return NextResponse.json({ error: 'AI failed to generate articles' }, { status: 500 })
    }

    // 3. Save to Supabase as 'draft'
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const date = new Date().toISOString().split('T')[0]
    const rowsToInsert = object.articles.map(a => ({
      title: a.title,
      category: a.category,
      source: a.source,
      direct_fact: a.direct_fact,
      key_specifics: a.key_specifics,
      exam_lens: a.exam_lens,
      date: date,
      status: 'draft'
    }))

    const { data, error } = await supabase
      .from('current_affairs')
      .insert(rowsToInsert)

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: object.articles.length })

  } catch (error: any) {
    console.error('Error scraping news:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
