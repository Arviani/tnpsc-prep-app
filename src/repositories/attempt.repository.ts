import { createClient } from '@/lib/supabase/client'
import { Session } from '@/types/attempt'
import { DatabaseError, UnauthorizedError } from '@/lib/errors'

export class AttemptRepository {
  async saveSession(sessionData: Session): Promise<void> {
    const supabase = createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    if (userError || !userData.user) {
      throw new UnauthorizedError('User not authenticated')
    }

    const { error } = await supabase
      .from('sessions')
      .insert({
        user_id: userData.user.id,
        ...sessionData,
        status: 'completed',
        type: sessionData.type || 'practice'
      })

    if (error) {
      throw new DatabaseError(error.message)
    }
  }
}

export const attemptRepository = new AttemptRepository()
