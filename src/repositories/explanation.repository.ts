import { createClient } from '@/lib/supabase/server'
import { DatabaseError } from '@/lib/errors'

export class ExplanationRepository {
  async bulkInsertExplanations(explanations: any[]): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('explanations')
      .insert(explanations)

    if (error) throw new DatabaseError(error.message)
  }
}

export const explanationRepository = new ExplanationRepository()
