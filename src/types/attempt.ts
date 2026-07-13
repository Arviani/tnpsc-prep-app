export interface Session {
  id?: string
  user_id?: string
  chapter_id?: string | null
  subject_id?: string | null
  paper_id?: string | null
  total_questions: number
  correct: number
  started_at: string
  ended_at?: string | null
  duration_sec?: number | null
  status?: string
  type?: string
}

export interface Attempt {
  id?: string
  user_id: string
  session_id?: string | null
  question_id: string
  selected_option_id?: string | null
  is_correct: boolean
  time_taken_sec?: number | null
  attempted_at?: string
}
