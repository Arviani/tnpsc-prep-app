export const EXAM_TYPES = {
  GROUP_1: 'Group 1',
  GROUP_2: 'Group 2',
  GROUP_2A: 'Group 2A',
  GROUP_4: 'Group 4',
  VAO: 'VAO',
  DEPARTMENTAL: 'Departmental Exams'
} as const

export type ExamType = typeof EXAM_TYPES[keyof typeof EXAM_TYPES]
