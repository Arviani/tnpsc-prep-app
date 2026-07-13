import React from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { FileText, Clock, ChevronLeft, Zap, Target } from 'lucide-react'

export default async function PYQPaperDetailsPage({ params }: { params: Promise<{ paperId: string }> }) {
  const { paperId } = await params
  const supabase = await createClient()

  const { data: paper, error } = await supabase
    .from('pyq_papers')
    .select('*')
    .eq('id', paperId)
    .single()

  if (error || !paper) {
    return notFound()
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <Link href="/pyq" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to PYQ Portal
      </Link>

      <div className="bg-card border rounded-2xl p-8 mb-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider">
            {paper.exam} {paper.year}
          </span>
          {paper.section && (
             <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
               {paper.section}
             </span>
          )}
        </div>
        
        <h1 className="text-3xl font-bold mb-6">{paper.title}</h1>
        
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-md"><FileText className="w-4 h-4 text-muted-foreground" /></div>
            <div>
              <p className="text-muted-foreground font-medium">Questions</p>
              <p className="font-bold text-base">{paper.total_questions}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-md"><Target className="w-4 h-4 text-muted-foreground" /></div>
            <div>
              <p className="text-muted-foreground font-medium">Marks</p>
              <p className="font-bold text-base">{paper.total_marks}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-md"><Clock className="w-4 h-4 text-muted-foreground" /></div>
            <div>
              <p className="text-muted-foreground font-medium">Duration</p>
              <p className="font-bold text-base">{paper.duration_minutes || (paper.total_questions * 1.5)} Mins</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6">Select Mode</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Link href={`/pyq/${paper.id}/practice`} className="group">
          <Card className="p-6 border-2 transition-all hover:border-primary h-full flex flex-col">
            <div className="p-3 bg-blue-500/10 w-fit rounded-xl mb-4 text-blue-600 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Practice Mode</h3>
            <p className="text-muted-foreground flex-1">
              Learn at your own pace. Get instant feedback, detailed explanations, and review correct answers immediately after selecting an option.
            </p>
            <div className="mt-6 font-medium text-blue-600 flex items-center group-hover:underline">
              Start Practice <ChevronLeft className="w-4 h-4 rotate-180 ml-1" />
            </div>
          </Card>
        </Link>

        <Link href={`/pyq/${paper.id}/exam`} className="group">
          <Card className="p-6 border-2 transition-all hover:border-primary h-full flex flex-col">
            <div className="p-3 bg-purple-500/10 w-fit rounded-xl mb-4 text-purple-600 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Exam Mode</h3>
            <p className="text-muted-foreground flex-1">
              Simulate the real exam environment. Timed test with no immediate feedback. Submit at the end to get your final score and analytics.
            </p>
            <div className="mt-6 font-medium text-purple-600 flex items-center group-hover:underline">
              Start Exam <ChevronLeft className="w-4 h-4 rotate-180 ml-1" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
