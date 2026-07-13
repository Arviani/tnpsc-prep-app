import { createClient } from '@/lib/supabase/server'
import { Subject } from '@/types/subject'
import { DatabaseError } from '@/lib/errors'

export class SubjectRepository {
  async getAllSubjects(): Promise<Subject[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name')

    if (error) throw new DatabaseError(error.message)
    return data as Subject[]
  }

  async getSubjectById(id: string): Promise<Subject | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new DatabaseError(error.message)
    }
    return data as Subject
  }
}

export const subjectRepository = new SubjectRepository()
