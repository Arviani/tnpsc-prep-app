import React, { useState } from 'react'
import { ParsedQuestion } from '@/services/parser/schemas'
import { ValidationError } from '@/services/validation/validation.service'
import { AlertCircle, CheckCircle2, ChevronRight, DownloadCloud, FileText, Search } from 'lucide-react'

interface ReviewWorkspaceProps {
  questions: ParsedQuestion[]
  setQuestions: (q: ParsedQuestion[]) => void
  paperMetadata?: any
  setPaperMetadata?: (meta: any) => void
  validationErrors: ValidationError[]
  onImport: () => void
  onImportValidOnly?: () => void
  isImporting: boolean
  importError: string | null
}

export function ReviewWorkspace({
  questions,
  setQuestions,
  paperMetadata,
  setPaperMetadata,
  validationErrors,
  onImport,
  onImportValidOnly,
  isImporting,
  importError
}: ReviewWorkspaceProps) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [search, setSearch] = useState('')

  const activeQuestion = questions[selectedIdx]

  const updateActiveQuestion = (field: keyof ParsedQuestion, value: any) => {
    const updated = [...questions]
    updated[selectedIdx] = { ...updated[selectedIdx], [field]: value }
    setQuestions(updated)
  }

  const errorsForActive = validationErrors.filter(e => e.questionIndex === selectedIdx)

  return (
    <div className="flex h-[calc(100vh-10rem)] border border-border rounded-md overflow-hidden bg-card shadow-sm">
      {/* Left Sidebar - Question List */}
      <div className="w-[300px] border-r border-border flex flex-col bg-surface-muted">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search questions..."
              className="w-full pl-8 pr-3 py-1.5 text-[13px] rounded-md border border-input bg-background"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {validationErrors.length > 0 && (
            <div className="mt-2 text-xs font-medium text-destructive flex items-center gap-1.5 bg-destructive/10 px-2 py-1.5 rounded-md">
              <AlertCircle className="h-3.5 w-3.5" />
              {validationErrors.length} validation issues
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {questions.map((q, idx) => {
            const hasError = validationErrors.some(e => e.questionIndex === idx)
            return (
              <button
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors ${
                  selectedIdx === idx 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted border border-transparent'
                }`}
              >
                <div className={`flex-shrink-0 mt-0.5 ${hasError ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {hasError ? <AlertCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    Q{q.questionNumber || idx + 1}. {q.question || 'Empty Question'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {q.options?.length || 0} Options • {q.correctAnswer ? `Ans: ${q.correctAnswer}` : 'No Answer'}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="w-2/3 flex flex-col bg-card relative">
        {/* Paper Metadata Editor */
        paperMetadata && setPaperMetadata && (
          <div className="p-4 border-b border-border bg-muted/10">
            <h4 className="text-sm font-semibold mb-3">Paper Metadata</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">Exam Name</label>
                <input 
                  type="text" 
                  value={paperMetadata.exam || ''} 
                  onChange={e => setPaperMetadata({...paperMetadata, exam: e.target.value})}
                  className="w-full p-1.5 text-sm rounded border border-input bg-background"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Year</label>
                <input 
                  type="number" 
                  value={paperMetadata.year || ''} 
                  onChange={e => setPaperMetadata({...paperMetadata, year: parseInt(e.target.value)})}
                  className="w-full p-1.5 text-sm rounded border border-input bg-background"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Total Questions</label>
                <input 
                  type="number" 
                  value={paperMetadata.totalQuestions || questions.length} 
                  onChange={e => setPaperMetadata({...paperMetadata, totalQuestions: parseInt(e.target.value)})}
                  className="w-full p-1.5 text-sm rounded border border-input bg-background"
                />
              </div>
            </div>
          </div>
        )}

        {!activeQuestion ? (
          <div className="flex-1 flex items-center justify-center text-[13px] text-muted-foreground">Select a question to review</div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
              
              {errorsForActive.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 space-y-2">
                  <div className="font-semibold text-destructive text-[13px] flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> Issues to fix
                  </div>
                  <ul className="text-[13px] text-destructive/90 list-disc pl-5 space-y-1">
                    {errorsForActive.map((e, i) => <li key={i}>{e.message}</li>)}
                  </ul>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium">Question Number</label>
                    <input 
                      type="number"
                      value={activeQuestion.questionNumber || ''}
                      onChange={e => updateActiveQuestion('questionNumber', parseInt(e.target.value) || 0)}
                      className="w-full p-2 text-[13px] rounded-md border border-input bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium">Exam</label>
                    <input 
                      type="text"
                      value={activeQuestion.exam || ''}
                      onChange={e => updateActiveQuestion('exam', e.target.value)}
                      className="w-full p-2 text-[13px] rounded-md border border-input bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium">Question Text (Preserve Tamil/English)</label>
                  <textarea 
                    rows={4}
                    value={activeQuestion.question || ''}
                    onChange={e => updateActiveQuestion('question', e.target.value)}
                    className="w-full p-3 text-[14px] rounded-md border border-input bg-background resize-y"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Options</label>
                  <div className="space-y-2">
                    {activeQuestion.options?.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-start gap-3">
                        <div className="w-10 flex-shrink-0">
                          <input 
                            type="text"
                            value={opt.label || ''}
                            onChange={(e) => {
                              const newOpts = [...activeQuestion.options]
                              newOpts[oIdx].label = e.target.value as any
                              updateActiveQuestion('options', newOpts)
                            }}
                            className="w-full p-2 rounded-md border border-input bg-muted text-center font-bold"
                          />
                        </div>
                        <div className="flex-1">
                          <input 
                            type="text"
                            value={opt.body || ''}
                            onChange={(e) => {
                              const newOpts = [...activeQuestion.options]
                              newOpts[oIdx].body = e.target.value
                              updateActiveQuestion('options', newOpts)
                            }}
                            className="w-full p-2 rounded-md border border-input bg-background"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Correct Answer Label (e.g. A, B)</label>
                    <input 
                      type="text"
                      value={activeQuestion.correctAnswer || ''}
                      onChange={e => updateActiveQuestion('correctAnswer', e.target.value)}
                      className="w-full p-2 rounded-md border border-input bg-background font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Subject</label>
                    <input 
                      type="text"
                      value={activeQuestion.subject || ''}
                      onChange={e => updateActiveQuestion('subject', e.target.value)}
                      className="w-full p-2 rounded-md border border-input bg-background"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
              <div className="text-sm text-destructive font-medium">
                {importError && <span>Error: {importError}</span>}
              </div>
              <div className="flex items-center gap-3">
                {validationErrors.length > 0 && onImportValidOnly && (
                  <button 
                    onClick={onImportValidOnly}
                    disabled={isImporting}
                    className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-2.5 rounded-md font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border"
                  >
                    Skip Errors & Import
                  </button>
                )}
                <button 
                  onClick={onImport}
                  disabled={isImporting || validationErrors.length > 0}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImporting ? 'Importing...' : 'Approve & Import'}
                  {!isImporting && <DownloadCloud className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
