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
    <div className="bg-card border border-border rounded-md shadow-sm overflow-hidden flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between bg-surface-muted">
        <div className="flex items-center gap-3 flex-1">
          <Input 
            placeholder="Search questions..." 
            className="max-w-xs bg-background h-8 text-[13px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="outline" className="gap-2 h-8 text-[12px] px-3">
            <Filter className="w-3.5 h-3.5" /> Filter
          </Button>
        </div>
        <div className="text-[12px] font-medium text-muted-foreground">
          Showing {filteredQuestions.length} questions
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px] text-left">
          <thead className="text-[11px] font-semibold text-muted-foreground uppercase bg-surface-muted border-b border-border whitespace-nowrap">
            <tr>
              <th className="px-3 py-2.5">No.</th>
              <th className="px-3 py-2.5">Question</th>
              <th className="px-3 py-2.5">Subject</th>
              <th className="px-3 py-2.5">Chapter</th>
              <th className="px-3 py-2.5">Topic</th>
              <th className="px-3 py-2.5">Answer</th>
              <th className="px-3 py-2.5">Diff.</th>
              <th className="px-3 py-2.5">Exam/Year</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isPending ? (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-center text-muted-foreground text-[13px]">Loading questions...</td>
              </tr>
            ) : filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-center text-muted-foreground text-[13px]">No questions found.</td>
              </tr>
            ) : (
              filteredQuestions.map((q) => (
                <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2.5 text-muted-foreground">{q.question_no}</td>
                  <td className="px-3 py-2.5 max-w-xs font-medium">
                    <div className="line-clamp-2" title={q.body}>{q.body}</div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{q.subject || '-'}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="line-clamp-1 max-w-[150px]" title={q.chapter || ''}>{q.chapter || '-'}</div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{q.topic || '-'}</td>
                  <td className="px-3 py-2.5">{getAnswerBadge(q.correct_answer)}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{q.difficulty || '-'}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[11px] font-medium bg-primary/10 text-primary">
                      {q.exam || 'Unknown'} - {q.year || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{getStatusBadge(q.status)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex justify-end gap-1.5 text-muted-foreground">
                      <button className="p-1 hover:text-primary transition-colors bg-surface-muted rounded border border-transparent hover:border-border" title="Edit Question"><FileEdit className="w-3.5 h-3.5" /></button>
                      <button className="p-1 hover:text-destructive transition-colors bg-surface-muted rounded border border-transparent hover:border-border" title="Delete"><Trash className="w-3.5 h-3.5" /></button>
                      <button className="p-1 hover:text-foreground transition-colors bg-surface-muted rounded border border-transparent hover:border-border"><MoreHorizontal className="w-3.5 h-3.5" /></button>
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
