'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface ExplanationCardProps {
  body: string
}

export function ExplanationCard({ body }: ExplanationCardProps) {
  return (
    <Card className="mb-6 animate-in slide-in-from-bottom-2 fade-in duration-300 shadow-none bg-secondary/50 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary text-lg">
          Explanation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-foreground text-sm md:text-base leading-relaxed">
          {body}
        </p>
      </CardContent>
    </Card>
  )
}
