import React from 'react'
import { BarChart2, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function PerformancePage() {
  return (
    <div className="flex flex-col items-center justify-center h-[500px] w-full text-center max-w-2xl mx-auto px-4">
      <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-6 shadow-sm border border-border">
        <BarChart2 className="w-8 h-8 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-3">Topic Performance Analytics</h2>
      <p className="text-muted-foreground text-base mb-8">
        You haven't generated any performance data for this topic yet. Complete practice exercises and tests to unlock your personalized insights.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full opacity-60 pointer-events-none">
        <Card className="p-6 border-dashed bg-card/50">
          <div className="text-sm text-muted-foreground mb-2">Accuracy Rate</div>
          <div className="text-2xl font-bold text-foreground">--%</div>
        </Card>
        <Card className="p-6 border-dashed bg-card/50">
          <div className="text-sm text-muted-foreground mb-2">Questions Attempted</div>
          <div className="text-2xl font-bold text-foreground">--</div>
        </Card>
      </div>
    </div>
  )
}
