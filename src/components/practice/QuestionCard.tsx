'use client'

interface QuestionCardProps {
  body: string
}

export function QuestionCard({ body }: QuestionCardProps) {
  return (
    <h2 className="text-[15px] font-semibold text-foreground mb-4 leading-relaxed">
      {body}
    </h2>
  )
}
