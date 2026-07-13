import { createClient } from '@/lib/supabase/server'
import { DatabaseError } from '@/lib/errors'
import { Option } from '@/types/question'

export class OptionRepository {
  async bulkInsertOptions(options: any[]): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('options')
      .insert(options)

    if (error) throw new DatabaseError(error.message)
  }
}

export const optionRepository = new OptionRepository()
