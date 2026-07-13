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
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.10)] border border-[#CFCFCF] p-8 text-center mb-8">
          <h1 className="text-[34px] font-[650] mb-2 font-display tracking-[-0.035em]">🎉 Practice Completed</h1>
          <p className="text-gray-500 mb-8 font-body">You have successfully completed the practice session.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-left">
            <div className="bg-[#F8F9FA] p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1 font-body">Total Questions</div>
              <div className="text-2xl font-bold font-display">{total}</div>
            </div>
            <div className="bg-[#F8F9FA] p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1 font-body">Correct Answers</div>
              <div className="text-2xl font-bold text-green-600 font-display">{correct}</div>
            </div>
            <div className="bg-[#F8F9FA] p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1 font-body">Wrong Answers</div>
              <div className="text-2xl font-bold text-red-600 font-display">{wrong}</div>
            </div>
            <div className="bg-[#F8F9FA] p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1 font-body">Accuracy %</div>
              <div className="text-2xl font-bold font-display">{accuracy}%</div>
            </div>
          </div>

          <div className="mb-10 bg-[#F8F9FA] rounded-lg p-6">
            <div className="text-lg text-gray-600 font-semibold mb-2 font-body">Performance</div>
            <div className={`text-[40px] font-bold font-display ${performanceColor}`}>{performanceText}</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {chapterId && (
              <Link href={`/practice/${chapterId}`}>
                <Button className="rounded-[14px] bg-[#202020] text-white hover:bg-[#1E1E1E] px-[18px] py-[12px] h-auto font-button">
                  Retry Practice
                </Button>
              </Link>
            )}
            {paperId && mode === 'exam' && (
              <Link href={`/pyq/${paperId}/exam`}>
                <Button className="rounded-[14px] bg-[#202020] text-white hover:bg-[#1E1E1E] px-[18px] py-[12px] h-auto font-button">
                  Retry Exam
                </Button>
              </Link>
            )}
            {paperId && mode !== 'exam' && (
              <Link href={`/pyq/${paperId}/practice`}>
                <Button className="rounded-[14px] bg-[#202020] text-white hover:bg-[#1E1E1E] px-[18px] py-[12px] h-auto font-button">
                  Retry Practice
                </Button>
              </Link>
            )}
            {paperId ? (
              <Link href="/pyq">
                <Button variant="outline" className="rounded-[14px] border-[#CFCFCF] px-[18px] py-[12px] h-auto font-button">
                  Back to PYQs
                </Button>
              </Link>
            ) : (
              <Link href="/subjects">
                <Button variant="outline" className="rounded-[14px] border-[#CFCFCF] px-[18px] py-[12px] h-auto font-button">
                  Back to Subjects
                </Button>
              </Link>
            )}
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-[14px] border-[#CFCFCF] px-[18px] py-[12px] h-auto font-button">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </ContentArea>
  )
}
