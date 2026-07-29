import React from 'react'
import { Card } from '@/components/ui/card'
import { History, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PYQsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] w-full text-center max-w-2xl mx-auto px-4">
      <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-6 shadow-sm border border-border">
        <History className="w-8 h-8 text-indigo-500" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-3">Previous Year Questions</h2>
      <p className="text-muted-foreground text-base mb-8">
        There are currently no previous year questions mapped to this specific topic. 
        As we update our question banks with past TNPSC exams, they will appear here.
      </p>
      <Button variant="outline" className="border-border">
        <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
        Request AI Generation
      </Button>
    </div>
  )
}
