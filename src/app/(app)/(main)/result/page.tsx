import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ContentArea } from '@/components/common/ContentArea'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ResultPage({ searchParams }: PageProps) {
  const params = await searchParams
  const total = Number(params.total) || 0
  const correct = Number(params.correct) || 0
  const chapterId = params.chapterId as string
  const paperId = params.paperId as string
  const mode = params.mode as string
  const wrong = total - correct
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  let performanceText = 'Needs Improvement'
  let performanceColor = 'text-red-500'

  if (accuracy >= 90) {
    performanceText = 'Excellent'
    performanceColor = 'text-green-500'
  } else if (accuracy >= 75) {
    performanceText = 'Good'
    performanceColor = 'text-blue-500'
  } else if (accuracy >= 50) {
    performanceText = 'Average'
    performanceColor = 'text-yellow-500'
  }

  return (
    <ContentArea>
      <div className="max-w-2xl mx-auto w-full">
        <div className="bg-card rounded-md shadow-sm border border-border p-5 text-center mb-5">
          <h1 className="text-xl font-bold mb-1">🎉 Practice Completed</h1>
          <p className="text-[13px] text-muted-foreground mb-6">You have successfully completed the practice session.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 text-left">
            <div className="bg-surface-muted p-3 rounded-md border border-border">
              <div className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Total Questions</div>
              <div className="text-lg font-bold">{total}</div>
            </div>
            <div className="bg-surface-muted p-3 rounded-md border border-border">
              <div className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Correct Answers</div>
              <div className="text-lg font-bold text-success">{correct}</div>
            </div>
            <div className="bg-surface-muted p-3 rounded-md border border-border">
              <div className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Wrong Answers</div>
              <div className="text-lg font-bold text-destructive">{wrong}</div>
            </div>
            <div className="bg-surface-muted p-3 rounded-md border border-border">
              <div className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Accuracy %</div>
              <div className="text-lg font-bold">{accuracy}%</div>
            </div>
          </div>

          <div className="mb-6 bg-surface-muted rounded-md p-4 border border-border">
            <div className="text-[12px] text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Performance</div>
            <div className={`text-2xl font-bold ${performanceColor}`}>{performanceText}</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {chapterId && (
              <Link href={`/practice/${chapterId}`}>
                <Button className="font-semibold h-8 text-[12px]">
                  Retry Practice
                </Button>
              </Link>
            )}
            {paperId && mode === 'exam' && (
              <Link href={`/pyq/${paperId}/exam`}>
                <Button className="font-semibold h-8 text-[12px]">
                  Retry Exam
                </Button>
              </Link>
            )}
            {paperId && mode !== 'exam' && (
              <Link href={`/pyq/${paperId}/practice`}>
                <Button className="font-semibold h-8 text-[12px]">
                  Retry Practice
                </Button>
              </Link>
            )}
            {paperId ? (
              <Link href="/pyq">
                <Button variant="outline" className="font-semibold h-8 text-[12px]">
                  Back to PYQs
                </Button>
              </Link>
            ) : (
              <Link href="/subjects">
                <Button variant="outline" className="font-semibold h-8 text-[12px]">
                  Back to Subjects
                </Button>
              </Link>
            )}
            <Link href="/dashboard">
              <Button variant="outline" className="font-semibold h-8 text-[12px]">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </ContentArea>
  )
}
