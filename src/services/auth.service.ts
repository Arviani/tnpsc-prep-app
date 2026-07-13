import { createClient } from '@/lib/supabase/server'
import { UserProfile } from '@/types/user'
import { DatabaseError, UnauthorizedError } from '@/lib/errors'

export class AuthService {
  async getUser(): Promise<UserProfile | null> {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name,
      role: profile?.role || 'student'
    } as UserProfile
  }

  async signOut(): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw new DatabaseError(error.message)
  }
}

export const authService = new AuthService()
