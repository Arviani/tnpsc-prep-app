'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Filter, MoreHorizontal, FileEdit, Trash } from 'lucide-react'
import { getAdminQuestionsAction, AdminQuestion } from '@/actions/admin-question.action'

export function QuestionDataTable() {
  const [questions, setQuestions] = useState<AdminQuestion[]>([])
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')

  useEffect(() => {
    startTransition(async () => {
      const data = await getAdminQuestionsAction()
      setQuestions(data)
    })
  }, [])

  const filteredQuestions = questions.filter(q => 
    q.body.toLowerCase().includes(search.toLowerCase()) || 
    q.subject?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: string | null) => {
    switch(status) {
      case 'Complete': return <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded-md text-xs font-medium">Complete</span>
      case 'Missing Answer': return <span className="px-2 py-1 bg-red-500/20 text-red-600 rounded-md text-xs font-medium">Missing Answer</span>
      default: return <span className="px-2 py-1 bg-orange-500/20 text-orange-600 rounded-md text-xs font-medium">{status || 'Incomplete'}</span>
    }
  }

  const getAnswerBadge = (answer: string | null) => {
    if (!answer) return <span className="px-2 py-1 bg-red-500/20 text-red-600 rounded-md text-xs font-medium">Missing</span>
    return <span className="font-bold text-primary">{answer}</span>
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-4 flex-1">
          <Input 
            placeholder="Search questions..." 
            className="max-w-xs bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredQuestions.length} questions
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border whitespace-nowrap">
            <tr>
              <th className="px-4 py-3 font-medium">No.</th>
              <th className="px-4 py-3 font-medium">Question</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Chapter</th>
              <th className="px-4 py-3 font-medium">Topic</th>
              <th className="px-4 py-3 font-medium">Answer</th>
              <th className="px-4 py-3 font-medium">Diff.</th>
              <th className="px-4 py-3 font-medium">Exam/Year</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isPending ? (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center text-muted-foreground">Loading questions...</td>
              </tr>
            ) : filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center text-muted-foreground">No questions found.</td>
              </tr>
            ) : (
              filteredQuestions.map((q) => (
                <tr key={q.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{q.question_no}</td>
                  <td className="px-4 py-3 max-w-xs font-medium">
                    <div className="line-clamp-2" title={q.body}>{q.body}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{q.subject || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="line-clamp-1 max-w-[150px]" title={q.chapter || ''}>{q.chapter || '-'}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{q.topic || '-'}</td>
                  <td className="px-4 py-3">{getAnswerBadge(q.correct_answer)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{q.difficulty || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                      {q.exam || 'Unknown'} - {q.year || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(q.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2 text-muted-foreground">
                      <button className="p-1 hover:text-primary transition-colors" title="Edit Question"><FileEdit className="w-4 h-4" /></button>
                      <button className="p-1 hover:text-destructive transition-colors" title="Delete"><Trash className="w-4 h-4" /></button>
                      <button className="p-1 hover:text-foreground transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
