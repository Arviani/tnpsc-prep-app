import React from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { ContentArea } from '@/components/common/ContentArea'
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
    <ContentArea>
      <div className="w-full max-w-4xl mx-auto">
        <Link href="/pyq" className="inline-flex items-center text-[13px] font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to PYQ Portal
        </Link>

        <div className="bg-card border border-border rounded-md p-5 mb-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-1.5 py-0.5 rounded bg-accent text-primary text-[11px] font-bold uppercase tracking-wider">
              {paper.exam} {paper.year}
            </span>
            {paper.section && (
               <span className="px-1.5 py-0.5 rounded bg-surface-muted text-muted-foreground text-[11px] font-medium">
                 {paper.section}
               </span>
            )}
          </div>
          
          <h1 className="text-xl font-bold mb-4">{paper.title}</h1>
          
          <div className="flex flex-wrap items-center gap-6 text-[13px]">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-surface-muted rounded"><FileText className="w-3.5 h-3.5 text-muted-foreground" /></div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Questions</p>
                <p className="font-semibold text-[13px]">{paper.total_questions}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 bg-surface-muted rounded"><Target className="w-3.5 h-3.5 text-muted-foreground" /></div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Marks</p>
                <p className="font-semibold text-[13px]">{paper.total_marks}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 bg-surface-muted rounded"><Clock className="w-3.5 h-3.5 text-muted-foreground" /></div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Duration</p>
                <p className="font-semibold text-[13px]">{paper.duration_minutes || (paper.total_questions * 1.5)} Mins</p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-[15px] font-bold mb-3">Select Mode</h2>
        
        <div className="grid md:grid-cols-2 gap-3">
          <Link href={`/pyq/${paper.id}/practice`} className="group">
            <Card className="p-4 border border-border transition-all hover:border-primary hover:shadow-sm rounded-md h-full flex flex-col">
              <div className="p-1.5 bg-blue-50 w-fit rounded mb-2 text-blue-600 group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-[14px] font-bold mb-1">Practice Mode</h3>
              <p className="text-[12px] text-muted-foreground flex-1">
                Learn at your own pace. Get instant feedback, detailed explanations, and review correct answers immediately after selecting an option.
              </p>
              <div className="mt-3 text-[12px] font-semibold text-blue-600 flex items-center group-hover:underline">
                Start Practice <ChevronLeft className="w-3.5 h-3.5 rotate-180 ml-1" />
              </div>
            </Card>
          </Link>

          <Link href={`/pyq/${paper.id}/exam`} className="group">
            <Card className="p-4 border border-border transition-all hover:border-primary hover:shadow-sm rounded-md h-full flex flex-col">
              <div className="p-1.5 bg-purple-50 w-fit rounded mb-2 text-purple-600 group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-[14px] font-bold mb-1">Exam Mode</h3>
              <p className="text-[12px] text-muted-foreground flex-1">
                Simulate the real exam environment. Timed test with no immediate feedback. Submit at the end to get your final score and analytics.
              </p>
              <div className="mt-3 text-[12px] font-semibold text-purple-600 flex items-center group-hover:underline">
                Start Exam <ChevronLeft className="w-3.5 h-3.5 rotate-180 ml-1" />
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </ContentArea>
  )
}
