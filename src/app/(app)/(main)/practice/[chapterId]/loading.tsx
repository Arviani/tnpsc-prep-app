import { ContentArea } from '@/components/common/ContentArea'
import { Skeleton } from '@/components/ui/skeleton'

export default function PracticeLoading() {
  return (
    <ContentArea>
      <div className="max-w-[900px] mx-auto py-8 px-4">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>

        {/* Question Card Skeleton */}
        <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-[0_4px_10px_rgba(13,21,48,0.05)] mb-6">
          <div className="mb-8 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>
          
          <div className="flex flex-col gap-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="flex justify-end mt-8">
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    </ContentArea>
  )
}
