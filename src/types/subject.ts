import { Chapter } from './chapter'

export interface Subject {
  id: string
  name: string
  description?: string | null
  chapters?: Chapter[]
}
