import React from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { BookOpen, Calendar, Clock, FileText } from 'lucide-react'

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
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Previous Year Questions (PYQ)</h1>
        <p className="text-muted-foreground">Practice real TNPSC exam papers in Exam mode or Practice mode.</p>
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
            <div key={examName} className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2 border-b pb-2">
                <FileText className="text-primary w-6 h-6" />
                {examName}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {examPapers.map((paper: any) => (
                  <Link href={`/pyq/${paper.id}`} key={paper.id} className="group">
                    <Card className="p-5 border-2 transition-all hover:border-primary/50 hover:shadow-md h-full flex flex-col">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {paper.year}
                          </span>
                          {paper.section && (
                            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                              {paper.section}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {paper.title}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4" />
                          <span>{paper.total_questions} Qs</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{paper.duration_minutes || (paper.total_questions * 1.5)} Mins</span>
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
  )
}
