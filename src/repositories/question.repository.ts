import { createClient } from '@/lib/supabase/server'
import { Question } from '@/types/question'
import { DatabaseError } from '@/lib/errors'

export class QuestionRepository {
  async getQuestionsByChapter(chapterId: string): Promise<Question[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('questions')
      .select(`
        id,
        body,
        options (
          id,
          body,
          label,
          is_correct
        ),
        explanations (
          id,
          body
        )
      `)
      .eq('chapter_id', chapterId)

    if (error) throw new DatabaseError(error.message)
    return (data || []) as unknown as Question[]
  }

  async bulkInsertQuestions(questions: any[]): Promise<any[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('questions')
      .insert(questions)
      .select('id')

    if (error) throw new DatabaseError(error.message)
    return data || []
  }

  async findDuplicateQuestions(bodies: string[]): Promise<any[]> {
    if (!bodies.length) return []
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('questions')
      .select('id, body')
      .in('body', bodies)

    if (error) throw new DatabaseError(error.message)
    return data || []
  }
}

export const questionRepository = new QuestionRepository()
