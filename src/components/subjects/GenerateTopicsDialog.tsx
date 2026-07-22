'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrainCircuit, Loader2, Sparkles, X, Plus, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { aiService, GeneratedTopic } from '@/services/ai.service'
import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import { toast } from "sonner"

interface GenerateTopicsDialogProps {
  subjectId: string
  subjectName: string
}

export function GenerateTopicsDialog({ subjectId, subjectName }: GenerateTopicsDialogProps) {
  const [open, setOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [topics, setTopics] = useState<GeneratedTopic[]>([])
  const [error, setError] = useState('')
  const router = useRouter()

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError('')
    try {
      const generated = await aiService.generateSubjectTopics(subjectName)
      setTopics(generated)
    } catch (err: any) {
      console.error('[GenerateTopicsDialog] Generation failed:', err)
      setError(err.message || 'Failed to generate topics. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (topics.length === 0) return
    setIsSaving(true)
    setError('')
    try {
      const chaptersToInsert = topics.map((t, index) => ({
        id: uuidv4(),
        title: t.title,
        description: t.description,
        order_index: index,
        created_at: new Date().toISOString()
      }))

      const response = await fetch('/api/admin/topics/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectId,
          topics: chaptersToInsert
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      if (data.inserted === 0) {
        toast.info(data.message || 'All topics already exist.')
      } else {
        toast.success(`${data.inserted} topics saved successfully!`)
      }

      setOpen(false)
      router.refresh()
    } catch (err: any) {
      console.error('[GenerateTopicsDialog] Error saving topics:', err)
      setError(`Failed to save topics: ${err.message || JSON.stringify(err)}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemove = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index))
  }

  const handleTitleChange = (index: number, newTitle: string) => {
    const updated = [...topics]
    updated[index].title = newTitle
    setTopics(updated)
  }
  
  const moveUp = (index: number) => {
    if (index === 0) return
    const updated = [...topics]
    const temp = updated[index]
    updated[index] = updated[index - 1]
    updated[index - 1] = temp
    setTopics(updated)
  }
  
  const moveDown = (index: number) => {
    if (index === topics.length - 1) return
    const updated = [...topics]
    const temp = updated[index]
    updated[index] = updated[index + 1]
    updated[index + 1] = temp
    setTopics(updated)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      // Reset state on close
      setTopics([])
      setError('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-lg px-4 font-semibold shadow-md bg-indigo-600 hover:bg-indigo-700 h-9 text-sm text-white">
        <BrainCircuit className="w-4 h-4 mr-2" /> Generate with AI
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Generate Syllabus with AI
          </DialogTitle>
          <DialogDescription>
            Our AI will automatically generate a complete TNPSC syllabus for {subjectName}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {topics.length === 0 && !isGenerating && (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <BrainCircuit className="w-12 h-12 text-indigo-300 mb-4" />
              <h4 className="font-semibold text-slate-900 mb-2">Ready to generate topics?</h4>
              <p className="text-sm text-slate-500 mb-6 max-w-sm">
                Click the button below to generate a comprehensive list of topics tailored for the TNPSC {subjectName} syllabus.
              </p>
              <Button onClick={handleGenerate} className="bg-indigo-600 hover:bg-indigo-700">
                <Sparkles className="w-4 h-4 mr-2" /> Generate Now
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
              <h4 className="font-semibold text-slate-900">Analyzing Syllabus...</h4>
              <p className="text-sm text-slate-500 mt-1">Generating optimal topics for {subjectName}</p>
            </div>
          )}

          {topics.length > 0 && !isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1 mb-2">
                <h4 className="font-semibold text-sm text-slate-700">Generated Topics ({topics.length})</h4>
                <span className="text-xs text-slate-500">Review and reorder before saving</span>
              </div>
              
              <div className="space-y-2">
                {topics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-lg group">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveUp(index)} disabled={index === 0} className="text-slate-300 hover:text-slate-600 disabled:opacity-30">
                        <GripVertical className="w-3 h-3 rotate-90" />
                      </button>
                      <button onClick={() => moveDown(index)} disabled={index === topics.length - 1} className="text-slate-300 hover:text-slate-600 disabled:opacity-30">
                        <GripVertical className="w-3 h-3 rotate-90" />
                      </button>
                    </div>
                    
                    <div className="flex-1 flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {index + 1}
                      </div>
                      <Input 
                        value={topic.title} 
                        onChange={(e) => handleTitleChange(index, e.target.value)}
                        className="h-8 text-sm font-medium border-transparent hover:border-slate-200 focus:border-indigo-300"
                      />
                    </div>
                    
                    <div className="shrink-0 flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                        ${topic.difficulty === 'Easy' ? 'bg-green-50 text-green-600 border border-green-100' : 
                          topic.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                          'bg-red-50 text-red-600 border border-red-100'}`}>
                        {topic.difficulty}
                      </span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleRemove(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" size="sm" className="w-full border-dashed mt-4 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" onClick={() => setTopics([...topics, { title: 'New Topic', description: '', difficulty: 'Medium', estimated_minutes: 30 }])}>
                <Plus className="w-4 h-4 mr-2" /> Add Custom Topic
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={topics.length === 0 || isSaving || isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              'Save Topics'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
