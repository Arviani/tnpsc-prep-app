export interface Option {
  id: string
  body: string
  label: string
  is_correct: boolean
}

export interface Explanation {
  id: string
  body: string
}

export interface Question {
  id: string
  body: string
  options: Option[]
  explanations: Explanation[] | Explanation | null
}
