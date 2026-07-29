import React from 'react'
import { ContentArea } from '@/components/common/ContentArea'
import { Card } from '@/components/ui/card'
import { BarChart3, LineChart, Target } from 'lucide-react'

export default function ProgressPage() {
  return (
    <ContentArea>
      <div className="w-full max-w-4xl mx-auto py-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">Your Performance</h1>
          <p className="text-muted-foreground text-lg">Track your learning progress, test scores, and weak areas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 flex flex-col items-center justify-center text-center border-border shadow-sm opacity-60">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Study Hours</h3>
            <p className="text-2xl font-bold text-muted-foreground">--</p>
          </Card>
          
          <Card className="p-6 flex flex-col items-center justify-center text-center border-border shadow-sm opacity-60">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Tests Attempted</h3>
            <p className="text-2xl font-bold text-muted-foreground">--</p>
          </Card>
          
          <Card className="p-6 flex flex-col items-center justify-center text-center border-border shadow-sm opacity-60">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
              <LineChart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Average Accuracy</h3>
            <p className="text-2xl font-bold text-muted-foreground">--</p>
          </Card>
        </div>

        <Card className="p-16 flex flex-col items-center justify-center text-center border-dashed border-2 border-border bg-card/50">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
            <BarChart3 className="w-10 h-10 text-muted-foreground opacity-50" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">No Performance Data Yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8 text-base">
            Start taking practice quizzes and reading study materials to generate your personalized performance analytics.
          </p>
        </Card>
      </div>
    </ContentArea>
  )
}
