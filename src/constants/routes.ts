export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  SUBJECTS: '/subjects',
  PRACTICE: (chapterId: string) => `/practice/${chapterId}`,
  RESULT: '/result',
  LOGIN: '/login',
  SIGNUP: '/signup'
} as const
