"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookMarked, PenTool, Target, Edit, Sparkles, CheckCircle, Trash } from 'lucide-react'
import { useWorkspace } from '@/contexts/WorkspaceContext'

interface TopicActionsProps {
  subjectId: string
  chapterId: string
  chapterProgress: number
  status?: 'empty' | 'draft' | 'review' | 'published'
}

export function TopicActions({ subjectId, chapterId, chapterProgress, status = 'empty' }: TopicActionsProps) {
  const { workspace } = useWorkspace()
  const isAdmin = workspace === 'admin'

  // Determine badge colors based on status
  const getStatusBadge = () => {
    switch(status) {
      case 'published':
        return <Button variant="outline" size="sm" className="w-full rounded-lg h-8 text-xs col-span-1 border-green-200 text-green-700 bg-green-50/50 hover:bg-green-100"><CheckCircle className="w-3.5 h-3.5 mr-1" /> Published</Button>
      case 'review':
        return <Button variant="outline" size="sm" className="w-full rounded-lg h-8 text-xs col-span-1 border-orange-200 text-orange-700 bg-orange-50/50 hover:bg-orange-100"><CheckCircle className="w-3.5 h-3.5 mr-1" /> Review</Button>
      case 'draft':
        return <Button variant="outline" size="sm" className="w-full rounded-lg h-8 text-xs col-span-1 border-yellow-200 text-yellow-700 bg-yellow-50/50 hover:bg-yellow-100"><Edit className="w-3.5 h-3.5 mr-1" /> Draft</Button>
      case 'empty':
      default:
        return <Button variant="outline" size="sm" className="w-full rounded-lg h-8 text-xs col-span-1 border-slate-200 text-slate-500 bg-slate-50 hover:bg-slate-100 cursor-default">Empty</Button>
    }
  }

  if (isAdmin) {
    return (
      <div className="mt-auto grid grid-cols-2 gap-2">
        <Link href={`/subjects/${subjectId}/topics/${chapterId}/study`} className="col-span-1">
          <Button variant="outline" size="sm" className="w-full rounded-lg border-indigo-200 hover:bg-indigo-50 hover:text-indigo-900 h-8 text-xs text-indigo-700 bg-indigo-50/50">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Manage Content
          </Button>
        </Link>
        <Button variant="outline" size="sm" className="w-full rounded-lg border-slate-200 hover:bg-slate-50 h-8 text-xs col-span-1">
          <Edit className="w-3.5 h-3.5 mr-1" /> Edit Info
        </Button>
        {getStatusBadge()}
        <Button variant="outline" size="sm" className="w-full rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-8 text-xs col-span-1">
          <Trash className="w-3.5 h-3.5 mr-1" /> Delete
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-auto grid grid-cols-3 gap-2">
      <Link href={`/subjects/${subjectId}/topics/${chapterId}/study`} className="col-span-1">
        <Button variant={chapterProgress > 0 ? "outline" : "default"} size="sm" className={`w-full rounded-lg h-8 text-xs ${chapterProgress === 0 ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-slate-200'}`}>
          <BookMarked className="w-3.5 h-3.5 mr-1" /> Study
        </Button>
      </Link>
      <Link href={`/subjects/${subjectId}/topics/${chapterId}/practice`} className="col-span-1">
        <Button variant="outline" size="sm" className="w-full rounded-lg border-slate-200 hover:bg-slate-50 hover:text-slate-900 h-8 text-xs">
          <PenTool className="w-3.5 h-3.5 mr-1" /> Practice
        </Button>
      </Link>
      <Link href={`/subjects/${subjectId}/topics/${chapterId}/quiz`} className="col-span-1">
        <Button variant="outline" size="sm" className="w-full rounded-lg border-slate-200 hover:bg-slate-50 hover:text-slate-900 h-8 text-xs">
          <Target className="w-3.5 h-3.5 mr-1" /> Quiz
        </Button>
      </Link>
    </div>
  )
}
