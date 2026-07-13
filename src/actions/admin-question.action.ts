'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'

export type AdminQuestion = {
  id: string
  question_no: number | null
  body: string
  subject: string | null
  chapter: string | null
  topic: string | null
  exam: string | null
  year: number | null
  difficulty: string | null
  status: string | null
  correct_answer: string | null
}

export async function getAdminQuestionsAction(): Promise<AdminQuestion[]> {
  const supabase = await createClient()

  const { data: questions, error } = await supabase
    .from('questions')
    .select(`
      id,
      body,
      exam_type,
      year,
      difficulty,
      topic,
      status,
      subjects(name),
      chapters(title),
      options(id, label, is_correct)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching admin questions:', error)
    return []
  }

  return (questions || []).map((q: any, index: number) => {
    // Find correct option label
    const correctOption = q.options?.find((o: any) => o.is_correct)
    const correctAnswer = correctOption ? correctOption.label : null

    // Compute dynamic status if missing
    let status = q.status || 'Complete'
    if (!correctAnswer) status = 'Missing Answer'
    else if (!q.subjects?.name) status = 'Missing Subject'
    else if (!q.chapters?.title) status = 'Missing Chapter'
    else if (!q.topic) status = 'Missing Topic'

    return {
      id: q.id,
      question_no: index + 1, // Fallback for display
      body: q.body,
      subject: q.subjects?.name || null,
      chapter: q.chapters?.title || null,
      topic: q.topic || null,
      exam: q.exam_type || null,
      year: q.year || null,
      difficulty: q.difficulty || null,
      status: status,
      correct_answer: correctAnswer,
    }
  })
}
