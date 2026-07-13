'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'
import { processAnswerKeyAction, AnswerKeyImportSummary } from '@/actions/answer-key.action'

export default function ImportAnswerKeyPage() {
  const [exam, setExam] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [textData, setTextData] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [summary, setSummary] = useState<AnswerKeyImportSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    if (!exam || !textData) {
      setError('Please provide exam name and answer key text.')
      return
    }

    setIsProcessing(true)
    setError(null)
    setSummary(null)

    const res = await processAnswerKeyAction(textData, exam, year)
    if (res.success && res.data) {
      setSummary(res.data)
    } else {
      setError(res.error || 'Unknown error occurred.')
    }
    
    setIsProcessing(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" /> Import Answer Key
        </h1>
        <p className="text-muted-foreground mt-2">Use Gemini AI to extract question numbers and correct answers from raw text or OCR data, and match them automatically to your database.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Exam Name (to match against)</label>
          <Input placeholder="e.g. TNPSC Group 4" value={exam} onChange={e => setExam(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Exam Year (to match against)</label>
          <Input type="number" value={year} onChange={e => setYear(parseInt(e.target.value) || 2024)} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Raw Answer Key Text (Copy/Paste PDF or TXT)</label>
        <textarea 
          className="w-full min-h-[300px] p-4 rounded-md border border-input bg-card shadow-sm font-mono text-sm"
          placeholder="1. A\n2. C\n3. B..."
          value={textData}
          onChange={e => setTextData(e.target.value)}
        />
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> {error}
        </div>
      )}

      {summary && (
        <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl space-y-4">
          <h3 className="font-bold text-green-700 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Import Successful
          </h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-background p-4 rounded-lg shadow-sm border border-border">
              <div className="text-2xl font-bold text-primary">{summary.imported}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Extracted</div>
            </div>
            <div className="bg-background p-4 rounded-lg shadow-sm border border-border">
              <div className="text-2xl font-bold text-green-600">{summary.updated}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Updated</div>
            </div>
            <div className="bg-background p-4 rounded-lg shadow-sm border border-border">
              <div className="text-2xl font-bold text-orange-500">{summary.missingQuestions}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Missing in DB</div>
            </div>
            <div className="bg-background p-4 rounded-lg shadow-sm border border-border">
              <div className="text-2xl font-bold text-destructive">{summary.unmatchedAnswers}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Unmatched</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-border">
        <Button size="lg" className="gap-2 w-full md:w-auto" onClick={handleImport} disabled={isProcessing}>
          {isProcessing ? 'Processing AI Extraction...' : <><Upload className="w-4 h-4" /> Process Answer Key</>}
        </Button>
      </div>
    </div>
  )
}
