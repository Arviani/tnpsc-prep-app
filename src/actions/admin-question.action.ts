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
  options: {
    id: string
    label: string
    body: string
    is_correct: boolean
  }[]
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
      options(id, label, body, is_correct)
    `)
    .order('created_at', { ascending: false })
    .limit(5000)

  if (error) {
    console.error('Error fetching admin questions:', error)
    return []
  }

  return (questions || []).map((q: any, index: number) => {
    const correctOption = q.options?.find((o: any) => o.is_correct)
    const correctAnswer = correctOption ? correctOption.label : null

    let status = q.status || 'Complete'
    if (!correctAnswer) status = 'Missing Answer'
    else if (!q.subjects?.name) status = 'Missing Subject'
    else if (!q.chapters?.title) status = 'Missing Chapter'
    else if (!q.topic) status = 'Missing Topic'

    return {
      id: q.id,
      question_no: index + 1,
      body: q.body,
      subject: q.subjects?.name || null,
      chapter: q.chapters?.title || null,
      topic: q.topic || null,
      exam: q.exam_type || null,
      year: q.year || null,
      difficulty: q.difficulty || null,
      status: status,
      correct_answer: correctAnswer,
      options: q.options || []
    }
  })
}

export async function deleteQuestionAction(id: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase.from('questions').delete().eq('id', id)
  if (error) {
    console.error('Error deleting question:', error)
    return false
  }
  return true
}

export async function updateQuestionAction(id: string, body: string, options: any[]): Promise<boolean> {
  const supabase = await createClient()
  const { error: qError } = await supabase.from('questions').update({ body }).eq('id', id)
  if (qError) return false

  // For simplicity, update each option individually
  for (const opt of options) {
    if (opt.id) {
      await supabase.from('options').update({
        body: opt.body,
        label: opt.label,
        is_correct: opt.is_correct
      }).eq('id', opt.id)
    }
  }
  return true
}

export async function deleteQuestionsAction(ids: string[]): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase.from('questions').delete().in('id', ids)
  if (error) {
    console.error('Error deleting questions:', error)
    return false
  }
  return true
}

export async function deleteDuplicateQuestionsAction(exam: string, part?: string): Promise<{ success: boolean, deletedCount: number, error?: string }> {
  const supabase = await createClient()
  
  try {
    let query = supabase.from('questions').select('id, body').eq('exam_type', exam)
    if (part) {
      query = query.eq('topic', part)
    }

    const { data, error } = await query
    
    if (error) throw error
    if (!data || data.length === 0) return { success: true, deletedCount: 0 }

    const uniqueQuestions: { id: string, normalized: string }[] = []
    const duplicateIds: string[] = []

    // Helper to calculate Levenshtein distance
    const levenshtein = (a: string, b: string) => {
      const m = a.length, n = b.length;
      if (!m) return n; if (!n) return m;
      const d = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));
      for (let i = 0; i <= m; i++) d[i][0] = i;
      for (let j = 0; j <= n; j++) d[0][j] = j;
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          const cost = a[i-1] === b[j-1] ? 0 : 1;
          d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + cost);
        }
      }
      return d[m][n];
    }

    for (const q of data) {
      // Normalize body for comparison: remove all characters except Tamil letters, English letters, and numbers
      const normalized = q.body.toLowerCase().replace(/[^\u0B80-\u0BFFa-z0-9]/g, '')
      
      let isDuplicate = false
      for (const uq of uniqueQuestions) {
        // Fast exact check
        if (uq.normalized === normalized) {
          isDuplicate = true
          break
        }
        
        // Fuzzy check (if similarity > 90%)
        const maxLen = Math.max(uq.normalized.length, normalized.length)
        if (maxLen > 10) { // Only do fuzzy matching for reasonably long strings
          const dist = levenshtein(uq.normalized, normalized)
          if (dist / maxLen < 0.15) { // Allow up to 15% difference
            isDuplicate = true
            break
          }
        }
      }

      if (isDuplicate) {
        duplicateIds.push(q.id)
      } else {
        uniqueQuestions.push({ id: q.id, normalized })
      }
    }

    if (duplicateIds.length === 0) {
      return { success: true, deletedCount: 0 }
    }

    // Delete in batches if too large, but usually < 1000
    const { error: deleteError } = await supabase.from('questions').delete().in('id', duplicateIds)
    if (deleteError) throw deleteError

    return { success: true, deletedCount: duplicateIds.length }
  } catch (error: any) {
    console.error('Error finding duplicates:', error)
    return { success: false, deletedCount: 0, error: error.message }
  }
}
