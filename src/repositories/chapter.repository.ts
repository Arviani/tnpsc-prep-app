import { createClient } from '@/lib/supabase/server'
import { Chapter } from '@/types/chapter'
import { DatabaseError } from '@/lib/errors'

export class ChapterRepository {
  async getChaptersBySubject(subjectId: string): Promise<Chapter[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('subject_id', subjectId)
      .order('order_index', { ascending: true })

    if (error) throw new DatabaseError(error.message)
    return data as Chapter[]
  }

  async getChapterById(chapterId: string): Promise<Chapter | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new DatabaseError(error.message)
    }
    return data as Chapter
  }
}

export const chapterRepository = new ChapterRepository()
