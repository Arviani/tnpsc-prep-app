'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Sparkles, Save, BookOpen, Hash, Tag, Brain, Layers } from 'lucide-react'
import { generateQuestionMetadataAction } from '@/actions/ai-metadata.action'

interface QuestionEditorProps {
  question: any
  onClose: () => void
  onSave: (data: any) => void
}

export function QuestionEditorModal({ question, onClose, onSave }: QuestionEditorProps) {
  const [formData, setFormData] = useState({ ...question })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleAI = async (field: 'subject' | 'chapter' | 'topic' | 'difficulty' | 'explanation' | 'keywords') => {
    try {
      setIsGenerating(true)
      const res = await generateQuestionMetadataAction(formData.body, formData.options || [], field)
      setFormData((prev: any) => ({ ...prev, [field]: res }))
    } catch (e) {
      alert('Failed to generate ' + field)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
      <div className="w-[800px] bg-background h-full flex flex-col shadow-2xl border-l border-border animate-in slide-in-from-right">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/10">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Edit Question #{question.question_no}</h2>
            <p className="text-sm text-muted-foreground mt-1">Make modifications and generate AI metadata.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Core Content */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Core Question
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Question Text</label>
              <textarea 
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-transparent text-sm shadow-sm"
                value={formData.body}
                onChange={(e) => setFormData({...formData, body: e.target.value})}
              />
            </div>
          </section>

          {/* AI Metadata Generation */}
          <section className="space-y-4 bg-primary/5 p-4 rounded-lg border border-primary/10">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Metadata Generators
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Use Gemini to automatically classify this question based on its text.</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="gap-2 bg-background" onClick={() => handleAI('subject')} disabled={isGenerating}>
                <Layers className="w-3 h-3" /> Gen Subject
              </Button>
              <Button size="sm" variant="outline" className="gap-2 bg-background" onClick={() => handleAI('chapter')} disabled={isGenerating}>
                <BookOpen className="w-3 h-3" /> Gen Chapter
              </Button>
              <Button size="sm" variant="outline" className="gap-2 bg-background" onClick={() => handleAI('topic')} disabled={isGenerating}>
                <Hash className="w-3 h-3" /> Gen Topic
              </Button>
              <Button size="sm" variant="outline" className="gap-2 bg-background" onClick={() => handleAI('difficulty')} disabled={isGenerating}>
                <Brain className="w-3 h-3" /> Gen Difficulty
              </Button>
              <Button size="sm" variant="outline" className="gap-2 bg-background" onClick={() => handleAI('keywords')} disabled={isGenerating}>
                <Tag className="w-3 h-3" /> Gen Keywords
              </Button>
            </div>
          </section>

          {/* Classification Fields */}
          <section className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input value={formData.subject || ''} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Chapter</label>
                <Input value={formData.chapter || ''} onChange={(e) => setFormData({...formData, chapter: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic</label>
                <Input value={formData.topic || ''} onChange={(e) => setFormData({...formData, topic: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Input value={formData.difficulty || ''} onChange={(e) => setFormData({...formData, difficulty: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Keywords</label>
                <Input value={formData.keywords || ''} onChange={(e) => setFormData({...formData, keywords: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Exam & Year</label>
                <div className="flex gap-2">
                  <Input value={formData.exam || ''} onChange={(e) => setFormData({...formData, exam: e.target.value})} placeholder="Exam" />
                  <Input value={formData.year || ''} onChange={(e) => setFormData({...formData, year: parseInt(e.target.value) || e.target.value})} placeholder="Year" type="number" className="w-24" />
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end gap-4 bg-muted/10">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(formData)} className="gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
