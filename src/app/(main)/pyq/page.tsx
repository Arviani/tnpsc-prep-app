import React from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { ContentArea } from '@/components/common/ContentArea'
import { FileText, Clock, BookOpen, Calendar } from 'lucide-react'

export default async function PYQPortalPage() {
  const supabase = await createClient()

  // Fetch all published papers
  const { data: papers, error } = await supabase
    .from('pyq_papers')
    .select('*')
    .eq('status', 'Published')
    .order('year', { ascending: false })
    .order('exam', { ascending: true })

  if (error) {
    return <div className="p-8 text-destructive">Failed to load PYQ Papers.</div>
  }

  // Group papers by Exam
  const groupedPapers = papers?.reduce((acc: any, paper: any) => {
    if (!acc[paper.exam]) acc[paper.exam] = []
    acc[paper.exam].push(paper)
    return acc
  }, {}) || {}

  return (
    <ContentArea>
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-1">Previous Year Questions (PYQ)</h1>
          <p className="text-[13px] text-muted-foreground">Practice real TNPSC exam papers in Exam mode or Practice mode.</p>
        </div>

        {Object.keys(groupedPapers).length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground mb-1">No Papers Available</h3>
            <p>Check back later for new PYQ additions.</p>
          </Card>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedPapers).map(([examName, examPapers]: [string, any]) => (
              <div key={examName} className="space-y-3">
                <h2 className="text-[15px] font-bold flex items-center gap-2 border-b border-border pb-2">
                  <FileText className="text-primary w-4 h-4" />
                  {examName}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {examPapers.map((paper: any) => (
                    <Link href={`/pyq/${paper.id}`} key={paper.id} className="group">
                      <Card className="p-3 border border-border shadow-sm transition-all hover:border-border-strong rounded-md h-full flex flex-col">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-1.5 py-0.5 rounded bg-accent text-primary text-[11px] font-bold">
                              {paper.year}
                            </span>
                            {paper.section && (
                              <span className="text-[11px] font-medium text-muted-foreground bg-surface-muted px-1.5 py-0.5 rounded">
                                {paper.section}
                              </span>
                            )}
                          </div>
                          <h3 className="text-[13px] font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {paper.title}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border text-[12px] text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            <span className="font-medium">{paper.total_questions} Qs</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="font-medium">{paper.duration_minutes || (paper.total_questions * 1.5)} Mins</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ContentArea>
  )
}
