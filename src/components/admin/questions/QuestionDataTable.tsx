'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Filter, MoreHorizontal, FileEdit, Trash, ChevronRight, Folder, FolderOpen, FileText, Download, CopyX } from 'lucide-react'
import { getAdminQuestionsAction, deleteQuestionAction, updateQuestionAction, deleteQuestionsAction, deleteDuplicateQuestionsAction, AdminQuestion } from '@/actions/admin-question.action'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function QuestionDataTable() {
  const [questions, setQuestions] = useState<AdminQuestion[]>([])
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')

  const [selectedExamKey, setSelectedExamKey] = useState<string | null>(null)
  const [selectedPart, setSelectedPart] = useState<string | null>(null)

  // Modals state
  const [viewQuestion, setViewQuestion] = useState<AdminQuestion | null>(null)
  const [editQuestion, setEditQuestion] = useState<AdminQuestion | null>(null)
  const [deleteQuestion, setDeleteQuestion] = useState<AdminQuestion | null>(null)
  const [deleteGroup, setDeleteGroup] = useState<{name: string, questions: AdminQuestion[]} | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  
  // Edit State
  const [editBody, setEditBody] = useState('')
  const [editOptions, setEditOptions] = useState<any[]>([])

  const loadQuestions = () => {
    startTransition(async () => {
      const data = await getAdminQuestionsAction()
      setQuestions(data)
    })
  }

  useEffect(() => {
    loadQuestions()
  }, [])

  const handleEditClick = (q: AdminQuestion) => {
    setEditQuestion(q)
    setEditBody(q.body)
    setEditOptions(JSON.parse(JSON.stringify(q.options || [])))
  }

  const handleSaveEdit = async () => {
    if (!editQuestion) return
    const success = await updateQuestionAction(editQuestion.id, editBody, editOptions)
    if (success) {
      setEditQuestion(null)
      loadQuestions()
    } else {
      alert("Failed to update question.")
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteQuestion) return
    const success = await deleteQuestionAction(deleteQuestion.id)
    if (success) {
      setDeleteQuestion(null)
      loadQuestions()
    } else {
      alert("Failed to delete question.")
    }
  }

  const handleDeleteGroupConfirm = async () => {
    if (!deleteGroup) return
    const ids = deleteGroup.questions.map(q => q.id)
    const success = await deleteQuestionsAction(ids)
    if (success) {
      setDeleteGroup(null)
      if (deleteGroup.name === selectedExamKey) {
        setSelectedExamKey(null)
        setSelectedPart(null)
      } else if (deleteGroup.name === selectedPart) {
        setSelectedPart(null)
      }
      loadQuestions()
    } else {
      alert("Failed to delete group.")
    }
  }

  const handleFindDuplicates = async (exam: string, part?: string) => {
    const result = await deleteDuplicateQuestionsAction(exam, part)
    if (result.success) {
      if (result.deletedCount === 0) {
        alert('No duplicates found in this group.')
      } else {
        alert(`Successfully found and removed ${result.deletedCount} duplicate question(s)!`)
        loadQuestions()
      }
    } else {
      alert(`Error finding duplicates: ${result.error}`)
    }
  }

  const handleExportGroup = (name: string, groupQs: AdminQuestion[]) => {
    let content = `<h1>${name}</h1>`;
    groupQs.forEach((q, i) => {
      content += `<p><b>${i + 1}. ${q.body}</b></p>`;
      if (q.options && q.options.length > 0) {
        q.options.forEach(opt => {
          content += `<p>(${opt.label}) ${opt.body}</p>`;
        });
        const correctOpt = q.options.find(o => o.is_correct)
        if (correctOpt) {
          content += `<p><b>Answer: (${correctOpt.label})</b></p>`;
        }
        content += `<br/>`;
      }
    });

    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${name}</title></head><body>${content}</body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const getAnswerBadge = (answer: string | null) => {
    if (!answer) return <span className="px-2 py-1 bg-red-500/20 text-red-600 rounded-md text-xs font-medium">Missing</span>
    return <span className="font-bold text-primary">{answer}</span>
  }

  // Group by Exam + Year
  const examsMap = new Map<string, AdminQuestion[]>()
  questions.forEach(q => {
    const examName = q.exam || 'Unknown Exam'
    const examYear = q.year || 'Unknown Year'
    const key = `${examName} ${examYear}`
    if (!examsMap.has(key)) examsMap.set(key, [])
    examsMap.get(key)!.push(q)
  })

  // Group by Part (if Exam selected)
  const partsMap = new Map<string, AdminQuestion[]>()
  if (selectedExamKey && examsMap.has(selectedExamKey)) {
    const examQuestions = examsMap.get(selectedExamKey)!
    examQuestions.forEach(q => {
      const partName = q.topic || 'Unknown Part'
      if (!partsMap.has(partName)) partsMap.set(partName, [])
      partsMap.get(partName)!.push(q)
    })
  }

  let finalQuestions: AdminQuestion[] = []
  if (selectedExamKey && selectedPart && partsMap.has(selectedPart)) {
    finalQuestions = partsMap.get(selectedPart)!
  }

  const filteredQuestions = finalQuestions.filter(q => 
    q.body.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-card px-4 py-3 rounded-md border border-border shadow-sm">
        <button 
          onClick={() => { setSelectedExamKey(null); setSelectedPart(null) }} 
          className={`flex items-center gap-1.5 transition-colors ${!selectedExamKey ? 'text-foreground' : 'hover:text-foreground'}`}
        >
          <Folder className="w-4 h-4" />
          Exams Database
        </button>
        {selectedExamKey && (
           <>
             <ChevronRight className="w-4 h-4" />
             <button 
                onClick={() => setSelectedPart(null)} 
                className={`flex items-center gap-1.5 transition-colors ${!selectedPart ? 'text-foreground' : 'hover:text-foreground'}`}
              >
               <FolderOpen className="w-4 h-4" />
               {selectedExamKey}
             </button>
           </>
        )}
        {selectedPart && (
           <>
             <ChevronRight className="w-4 h-4" />
             <span className="flex items-center gap-1.5 text-foreground">
                <FileText className="w-4 h-4" />
                {selectedPart}
             </span>
           </>
        )}
      </div>

      {isPending && (
        <div className="p-8 text-center text-muted-foreground bg-card border border-border rounded-md shadow-sm">
          Loading database...
        </div>
      )}

      {/* VIEW: List of Exams */}
      {!isPending && !selectedExamKey && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from(examsMap.entries()).map(([key, qs]) => (
            <div 
              key={key} 
              onClick={() => setSelectedExamKey(key)}
              className="bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all rounded-lg p-5 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-primary/10 rounded-md text-primary">
                  <Folder className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <span className="text-xs font-semibold px-2 py-1 bg-muted rounded-md text-muted-foreground">
                    {qs.length} Qs
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded border border-transparent hover:border-border data-open:bg-muted data-open:border-border data-open:text-foreground outline-none">
                      <MoreHorizontal className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 border border-border/50 shadow-md bg-card rounded-md">
                      <DropdownMenuItem onClick={() => handleExportGroup(key, qs)} className="cursor-pointer">
                        <Download className="w-4 h-4 mr-2" /> Export
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteGroup({name: key, questions: qs})} className="text-destructive focus:text-destructive cursor-pointer">
                        <Trash className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">{key}</h3>
              <p className="text-sm text-muted-foreground">Click to view parts</p>
            </div>
          ))}
          {examsMap.size === 0 && (
            <div className="col-span-full p-8 text-center text-muted-foreground border border-dashed rounded-lg">
              No exams found in database.
            </div>
          )}
        </div>
      )}

      {/* VIEW: List of Parts */}
      {!isPending && selectedExamKey && !selectedPart && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from(partsMap.entries()).map(([partName, qs]) => (
            <div 
              key={partName} 
              onClick={() => setSelectedPart(partName)}
              className="bg-card border border-border hover:border-indigo-500/50 hover:shadow-md transition-all rounded-lg p-5 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-md text-indigo-600">
                  <FolderOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <span className="text-xs font-semibold px-2 py-1 bg-muted rounded-md text-muted-foreground">
                    {qs.length} Qs
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded border border-transparent hover:border-border data-open:bg-muted data-open:border-border data-open:text-foreground outline-none">
                      <MoreHorizontal className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 border border-border/50 shadow-md bg-card rounded-md">
                      <DropdownMenuItem onClick={() => handleExportGroup(partName, qs)} className="cursor-pointer">
                        <Download className="w-4 h-4 mr-2" /> Export
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteGroup({name: partName, questions: qs})} className="text-destructive focus:text-destructive cursor-pointer">
                        <Trash className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">{partName}</h3>
              <p className="text-sm text-muted-foreground">Click to view questions</p>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: Questions Table */}
      {!isPending && selectedExamKey && selectedPart && (
        <div className="bg-card border border-border rounded-md shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-muted">
            <div className="text-[13px] font-semibold text-foreground flex items-center gap-2">
              Questions <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px]">{filteredQuestions.length}</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input 
                placeholder="Search..." 
                className="w-full sm:w-48 bg-background h-8 text-[13px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground" title="Filter">
                <Filter className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8 shrink-0 text-amber-600 border-amber-200 hover:bg-amber-50"
                onClick={() => handleFindDuplicates(selectedExamKey, selectedPart)}
                title="Find & Delete Duplicates"
              >
                <CopyX className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => handleExportGroup(selectedPart || selectedExamKey, filteredQuestions)}
                title="Export"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left">
              <thead className="text-[11px] font-semibold text-muted-foreground uppercase bg-surface-muted border-b border-border whitespace-nowrap">
                <tr>
                  <th className="px-3 py-2.5 w-12">No.</th>
                  <th className="px-3 py-2.5">Question</th>
                  <th className="px-3 py-2.5">Exam</th>
                  <th className="px-3 py-2.5">Year</th>
                  <th className="px-3 py-2.5">Part</th>
                  <th className="px-3 py-2.5">Answer</th>
                  <th className="px-3 py-2.5 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-6 text-center text-muted-foreground text-[13px]">No questions found matching your search.</td>
                  </tr>
                ) : (
                  filteredQuestions.map((q) => (
                    <tr key={q.id} className="group hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setViewQuestion(q)}>
                      <td className="px-3 py-2.5 text-muted-foreground">{q.question_no}</td>
                      <td className="px-3 py-2.5 max-w-xs font-medium">
                        <div className="line-clamp-2 hover:text-primary transition-colors" title="Click to view full question">{q.body}</div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                        {q.exam || '-'}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                        {q.year || '-'}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[11px] font-medium bg-indigo-500/10 text-indigo-600">
                          {q.topic || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">{getAnswerBadge(q.correct_answer)}</td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 has-[[data-open]]:opacity-100 has-[[data-popup-open]]:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEditClick(q); }} 
                            className="p-1 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded border border-transparent hover:border-border outline-none" 
                            title="Edit Question"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                          </button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-1 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded border border-transparent hover:border-border data-open:bg-muted data-open:border-border data-open:text-foreground data-popup-open:bg-muted data-popup-open:border-border data-popup-open:text-foreground outline-none">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32 border border-border/50 shadow-md bg-card rounded-md">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteQuestion(q); }} className="text-destructive focus:text-destructive cursor-pointer">
                                <Trash className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Question Modal */}
      <Dialog open={!!viewQuestion} onOpenChange={() => setViewQuestion(null)}>
        <DialogContent className="sm:max-w-[1200px] w-[90vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Question</DialogTitle>
          </DialogHeader>
          {viewQuestion && (
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg text-[15px] font-medium leading-relaxed">
                {viewQuestion.body}
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Options</h4>
                {viewQuestion.options?.map((opt, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${opt.is_correct ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' : 'bg-card border-border'}`}>
                    <span className="font-bold min-w-[24px]">{opt.label}.</span>
                    <span>{opt.body}</span>
                    {opt.is_correct && <span className="ml-auto text-xs font-bold uppercase tracking-wider">Correct</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Question Modal */}
      <Dialog open={!!editQuestion} onOpenChange={() => setEditQuestion(null)}>
        <DialogContent className="sm:max-w-[1400px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          {editQuestion && (
            <div className="mt-4 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Question Body</label>
                <textarea 
                  className="w-full min-h-[100px] p-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium">Options</label>
                {editOptions.map((opt, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 border border-border rounded-md bg-muted/20">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{opt.label}.</span>
                        <input 
                          type="text" 
                          className="flex-1 h-8 text-sm px-2 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                          value={opt.body}
                          onChange={(e) => {
                            const newOpts = [...editOptions]
                            newOpts[i].body = e.target.value
                            setEditOptions(newOpts)
                          }}
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input 
                        type="radio" 
                        name="correct_option" 
                        checked={opt.is_correct}
                        onChange={() => {
                          const newOpts = editOptions.map(o => ({ ...o, is_correct: false }))
                          newOpts[i].is_correct = true
                          setEditOptions(newOpts)
                        }}
                      />
                      <span className="text-sm">Correct</span>
                    </label>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditQuestion(null)}>Cancel</Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteQuestion} onOpenChange={() => setDeleteQuestion(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Are you sure you want to delete this question? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteQuestion(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation Modal */}
      <Dialog open={!!deleteGroup} onOpenChange={() => { setDeleteGroup(null); setDeleteConfirmText(''); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {deleteGroup?.name}?</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground space-y-4">
            <p>Are you sure you want to delete <strong>{deleteGroup?.name}</strong>?</p>
            <p className="text-destructive font-medium">This will permanently delete all {deleteGroup?.questions.length} questions in this group. This action cannot be undone.</p>
            
            <div className="space-y-2 pt-4 border-t border-border">
              <label className="text-xs font-semibold text-foreground uppercase">
                Type <span className="text-destructive select-all">{deleteGroup?.name}</span> to unlock deletion
              </label>
              <Input 
                value={deleteConfirmText} 
                onChange={e => setDeleteConfirmText(e.target.value)} 
                placeholder="Type name here to unlock..."
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteGroup(null); setDeleteConfirmText(''); }}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteGroupConfirm}
              disabled={deleteConfirmText !== deleteGroup?.name}
            >
              Delete All Questions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
