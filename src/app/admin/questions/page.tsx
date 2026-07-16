import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { QuestionDataTable } from '@/components/admin/questions/QuestionDataTable'

export const metadata = {
  title: 'Manage Questions | TNPSC CMS',
}

export default function QuestionsPage() {
  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Question Database</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Manage, filter, and review all extracted and manually created questions.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 h-8 text-[12px]">
            Bulk Actions
          </Button>
          <Button className="gap-2 h-8 text-[12px]">
            <Plus className="w-4 h-4" /> Add Question
          </Button>
        </div>
      </div>

      <QuestionDataTable />
    </div>
  )
}
