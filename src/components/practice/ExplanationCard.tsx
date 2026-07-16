'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface ExplanationCardProps {
  body: string
}

export function ExplanationCard({ body }: ExplanationCardProps) {
  return (
    <Card className="mb-4 animate-in slide-in-from-bottom-2 fade-in duration-300 shadow-none bg-surface-muted border-border rounded-md">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="flex items-center gap-2 text-primary text-[13px]">
          Explanation
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <p className="text-foreground text-[14px] leading-relaxed">
          {body}
        </p>
      </CardContent>
    </Card>
  )
}
