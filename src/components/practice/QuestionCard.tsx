'use client'

interface QuestionCardProps {
  body: string
}

export function QuestionCard({ body }: QuestionCardProps) {
  return (
    <h2 className="text-2xl md:text-3xl font-bold font-heading text-primary mb-6 leading-tight tracking-tight">
      {body}
    </h2>
  )
}
