import { attemptRepository } from '@/repositories/attempt.repository'
import { Session } from '@/types/attempt'

export interface SaveSessionPayload {
  chapter_id: string
  subject_id?: string | null
  paper_id?: string | null
  type?: string
  total_questions: number
  correct: number
  started_at: string
  ended_at: string
  duration_sec: number
}

export class AttemptService {
  async saveSession(payload: SaveSessionPayload): Promise<void> {
    await attemptRepository.saveSession({
      chapter_id: payload.chapter_id,
      subject_id: payload.subject_id,
      paper_id: payload.paper_id,
      type: payload.type || 'practice',
      total_questions: payload.total_questions,
      correct: payload.correct,
      started_at: payload.started_at,
      ended_at: payload.ended_at,
      duration_sec: payload.duration_sec
    })
  }
}

export const attemptService = new AttemptService()
