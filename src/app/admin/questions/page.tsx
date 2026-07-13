import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { QuestionDataTable } from '@/components/admin/questions/QuestionDataTable'

export const metadata = {
  title: 'Manage Questions | TNPSC CMS',
}

export default function QuestionsPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Question Database</h1>
          <p className="text-muted-foreground mt-2">Manage, filter, and review all extracted and manually created questions.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2">
            Bulk Actions
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Question
          </Button>
        </div>
      </div>

      <QuestionDataTable />
    </div>
  )
}
