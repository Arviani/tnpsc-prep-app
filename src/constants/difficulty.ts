export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
} as const

export type Difficulty = typeof DIFFICULTY[keyof typeof DIFFICULTY]
