"use client"

import React, { useState, useEffect } from 'react';
import { useGlobalAIStore } from '@/hooks/useGlobalAIStore';
import { buildPracticePrompt, PracticeAction } from '@/lib/ai/prompts/practice';
import { TopicContext } from '@/lib/ai/context';
import { Button } from '@/components/ui/button';
import { HelpCircle, Zap, Crosshair, AlertTriangle, CheckCircle2, ArrowRight, PenTool, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CMSActionBar } from '@/components/admin/CMSActionBar';
import { PracticeEditor } from '@/components/admin/editors/PracticeEditor';
import { ImportModal } from '@/components/admin/ImportModal';
import { SyllabusValidator, ValidationReport } from '@/lib/curriculum/validator';
import { SyllabusValidationPanel } from '@/components/admin/SyllabusValidationPanel';
import { toast } from 'sonner';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface Option {
  id: string;
  body: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  body: string;
  difficulty?: string;
  question_type?: string;
  marks?: number;
  negative_marks?: number;
  explanation?: string;
  shortcut?: string;
  exam_tip?: string;
  common_mistake?: string;
  options: Option[];
}

interface PracticeClientProps {
  subject: { id: string, name: string };
  chapter: { id: string, title: string };
  questions: Question[];
}

export default function PracticeClient({ subject, chapter, questions }: PracticeClientProps) {
  const { workspace } = useWorkspace();
  const isAdmin = workspace === 'admin';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  const context: TopicContext = {
    subject: subject.name,
    topic: chapter.title,
    currentTab: 'practice',
    exam: 'TNPSC Group 4',
    language: 'English',
    difficulty: 'Beginner',
    userRole: isAdmin ? 'admin' : 'student'
  };


  const [activeAction, setActiveAction] = useState<PracticeAction | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null);
  const router = require('next/navigation').useRouter();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/admin/practice/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectId: subject.id,
          subjectName: subject.name,
          topicId: chapter.id,
          topicTitle: chapter.title,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate practice questions');
      }

      // Success: Instead of just refreshing, show the generated questions for preview
      setGeneratedQuestions(data.questions);
    } catch (err: any) {
      console.error('Error generating practice questions:', err);
      alert(err.message || 'An error occurred while generating practice questions');
    } finally {
      setIsGenerating(false);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editorQuestions, setEditorQuestions] = useState<any[]>(questions || []);
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>(questions || []);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleImportComplete = (content: any, type: 'markdown' | 'json') => {
    if (type === 'json') {
      const formattedQuestions = (content as any[]).map(row => ({
        id: crypto.randomUUID(),
        body: row.Question || row.body || '',
        options: row.options ? row.options.map((opt: any) => ({ ...opt, id: opt.id || crypto.randomUUID() })) : [
          { id: crypto.randomUUID(), body: row.OptionA || row.optionA || '', is_correct: row.Answer === 'A' || row.answer === 'A' },
          { id: crypto.randomUUID(), body: row.OptionB || row.optionB || '', is_correct: row.Answer === 'B' || row.answer === 'B' },
          { id: crypto.randomUUID(), body: row.OptionC || row.optionC || '', is_correct: row.Answer === 'C' || row.answer === 'C' },
          { id: crypto.randomUUID(), body: row.OptionD || row.optionD || '', is_correct: row.Answer === 'D' || row.answer === 'D' }
        ],
        explanation: row.Explanation || row.explanation || '',
        shortcut: row.Shortcut || row.shortcut || '',
        exam_tip: row.Tip || row.exam_tip || '',
        common_mistake: row.Mistake || row.common_mistake || '',
        difficulty: row.Difficulty || row.difficulty || 'Medium',
        marks: Number(row.Marks || row.marks) || 1,
        negative_marks: Number(row.NegativeMarks || row.negative_marks) || 0.25
      }));
      setEditorQuestions([...editorQuestions, ...formattedQuestions]);
      setIsEditing(true);
    }
  };

  // Update editor if questions prop changes
  React.useEffect(() => {
    if (!isEditing) {
      setEditorQuestions(questions || []);
    }
    
    // Shuffle questions on client-side for Student view
    if (questions && questions.length > 0) {
      setShuffledQuestions([...questions].sort(() => Math.random() - 0.5));
    }
  }, [questions, isEditing]);

  const handleSaveDraft = async () => {
    await saveContent('draft');
  };

  const handlePublish = async () => {
    if (!editorQuestions || editorQuestions.length === 0) return;
    
    // Check syllabus validation
    if (!validationReport || validationReport.outOfSyllabusSections > 0) {
      setIsValidating(true);
      try {
        const report = await SyllabusValidator.validateContent(subject.id, chapter.title, editorQuestions, 'practice');
        setValidationReport(report);
        
        if (!report.isPublishable) {
          toast.error('Validation failed: Practice questions are out of syllabus. Please review.');
          return;
        }
      } catch (err: any) {
        console.error('Validation error:', err);
        toast.error(err.message || 'Validation failed');
        return;
      } finally {
        setIsValidating(false);
      }
    }
    
    await saveContent('published');
  };

  const saveContent = async (status: 'draft' | 'published') => {
    if (!editorQuestions || editorQuestions.length === 0) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/content/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectId: subject.id,
          topicId: chapter.id,
          contentType: 'practice',
          title: chapter.title,
          content: editorQuestions,
          status
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save questions');
      }

      toast.success(status === 'published' ? 'Practice Questions published successfully!' : 'Draft saved!');
      setIsEditing(false);
      setGeneratedQuestions(null);
      router.refresh();
    } catch (err: any) {
      console.error('Error saving practice questions:', err);
      toast.error(err.message || 'An error occurred while saving practice questions');
    } finally {
      setIsSaving(false);
    }
  };

  const hasContent = questions && questions.length > 0;
  // If we have generated questions, display them as the current content
  const displayQuestions = generatedQuestions || shuffledQuestions;
  const currentQuestion = displayQuestions && displayQuestions.length > 0 ? displayQuestions[currentIndex] : null;
  const correctOption = currentQuestion?.options.find((o: any) => o.is_correct);
  const isCorrect = selectedAnswerId === correctOption?.id;

  useEffect(() => {
    const store = useGlobalAIStore.getState();
    store.setContext(context);
    
    if (currentQuestion) {
      store.setActions([
        { 
          label: 'Why is this wrong?', 
          icon: HelpCircle, 
          prompt: buildPracticePrompt(
            context,
            currentQuestion.body || "",
            currentQuestion.options.map((o: any) => o.body) || [],
            currentQuestion.options.find((o: any) => o.id === selectedAnswerId)?.body || "",
            correctOption?.body || "",
            'why_wrong'
          ) 
        },
        { 
          label: 'Explain Concept', 
          icon: Zap, 
          prompt: buildPracticePrompt(
            context,
            currentQuestion.body || "",
            currentQuestion.options.map((o: any) => o.body) || [],
            currentQuestion.options.find((o: any) => o.id === selectedAnswerId)?.body || "",
            correctOption?.body || "",
            'explain_concept'
          ) 
        },
        { 
          label: 'Shortcut trick', 
          icon: Crosshair, 
          prompt: buildPracticePrompt(
            context,
            currentQuestion.body || "",
            currentQuestion.options.map((o: any) => o.body) || [],
            currentQuestion.options.find((o: any) => o.id === selectedAnswerId)?.body || "",
            correctOption?.body || "",
            'shortcut'
          ) 
        },
        { 
          label: 'Common Mistakes', 
          icon: AlertTriangle, 
          prompt: buildPracticePrompt(
            context,
            currentQuestion.body || "",
            currentQuestion.options.map((o: any) => o.body) || [],
            currentQuestion.options.find((o: any) => o.id === selectedAnswerId)?.body || "",
            correctOption?.body || "",
            'common_mistakes'
          ) 
        }
      ]);
    }
  }, [currentIndex, selectedAnswerId, hasSubmitted, currentQuestion, correctOption]);

  const handleSubmit = () => {
    if (selectedAnswerId) {
      setHasSubmitted(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswerId(null);
      setHasSubmitted(false);
    }
  };

  const isEmpty = !displayQuestions || displayQuestions.length === 0;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {isAdmin && (
        <CMSActionBar
          hasContent={hasContent}
          isEditing={isEditing}
          isSaving={isSaving}
          isValidating={isValidating}
          onManualCreate={() => setIsEditing(true)}
          onAIGenerate={() => {
            setIsEditing(true);
            handleGenerate();
          }}
          onImport={() => setIsImportModalOpen(true)}
          onEdit={() => setIsEditing(true)}
          onPreview={() => setIsEditing(false)}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          onArchive={() => toast.info('Archiving...')}
          onDelete={() => toast.info('Deleting...')}
          onViewHistory={() => toast.info('Opening version history...')}
          className="mb-6 max-w-3xl mx-auto"
        />
      )}
      
      {validationReport && (
        <div className="max-w-3xl mx-auto mb-6">
          <SyllabusValidationPanel 
            report={validationReport}
            onRemoveFlagged={(title) => {
              toast.info(`Please manually remove or replace "${title}" from the editor.`);
            }}
            onIgnoreFlag={(title) => {
              setValidationReport(prev => {
                if (!prev) return prev;
                const newFlags = prev.flags.filter(f => f.sectionTitle !== title);
                const newOutOfSyllabus = newFlags.filter(f => f.status === 'OUT OF SYLLABUS').length;
                return {
                  ...prev,
                  flags: newFlags,
                  outOfSyllabusSections: newOutOfSyllabus,
                  isPublishable: newOutOfSyllabus === 0
                };
              });
            }}
            onRevalidate={async () => {
              setIsValidating(true);
              try {
                const report = await SyllabusValidator.validateContent(subject.id, chapter.title, editorQuestions, 'practice');
                setValidationReport(report);
              } catch (e: any) {
                toast.error(e.message || 'Validation failed');
              } finally {
                setIsValidating(false);
              }
            }}
          />
        </div>
      )}

      {isEditing ? (
        <div className="max-w-3xl mx-auto">
          <PracticeEditor 
            content={generatedQuestions || editorQuestions} 
            onChange={setEditorQuestions} 
          />
        </div>
      ) : isEmpty ? (
        <div className="max-w-3xl mx-auto space-y-6 pb-12 h-[400px]">
          {isAdmin ? (
            <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed border-border rounded-xl bg-secondary/50 p-8">
              <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4 shadow-sm border border-border-subtle">
                <PenTool className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground">No practice questions available.</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mb-6">
                There are no practice questions for this topic yet. Generate them using AI or import them.
              </p>
              <Button onClick={() => setIsImportModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                <Sparkles className="w-4 h-4 mr-2" /> Import / Generate Practice Questions
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed border-border rounded-xl bg-secondary/50 p-8">
              <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4 shadow-sm border border-border-subtle">
                <AlertTriangle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">No practice questions available.</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                There are no practice questions available for this topic right now. Please check back later.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {/* Question Card */}
          <div className="bg-card p-8 rounded-2xl border border-border shadow-sm h-fit">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Question {currentIndex + 1} of {displayQuestions.length}
          </span>
          <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1"><HelpCircle className="w-4 h-4" /> Need Hint?</span>
        </div>
        
        <h2 className="text-xl font-bold text-foreground mb-8 leading-snug">{currentQuestion?.body}</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {currentQuestion?.options.map((option: any) => {
            const isSelected = selectedAnswerId === option.id;
            const isCorrectOption = option.is_correct;
            
            let buttonClass = "w-full justify-start text-left h-auto py-4 px-5 text-base rounded-xl border-2 transition-all duration-200";
            if (!hasSubmitted) {
              buttonClass = cn(buttonClass, isSelected ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold shadow-sm" : "border-border hover:border-indigo-300 hover:bg-secondary text-foreground");
            } else {
              if (isCorrectOption) {
                buttonClass = cn(buttonClass, "border-green-500 bg-green-50 text-green-900 font-bold shadow-sm");
              } else if (isSelected && !isCorrectOption) {
                buttonClass = cn(buttonClass, "border-red-400 bg-red-50 text-red-900 font-semibold");
              } else {
                buttonClass = cn(buttonClass, "border-border-subtle bg-secondary text-muted-foreground opacity-60");
              }
            }

            return (
              <button
                key={option.id}
                className={buttonClass}
                onClick={() => !hasSubmitted && setSelectedAnswerId(option.id)}
                disabled={hasSubmitted}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option.body}</span>
                  {hasSubmitted && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                </div>
              </button>
            );
          })}
        </div>

        {!hasSubmitted ? (
          <Button onClick={handleSubmit} disabled={!selectedAnswerId} size="lg" className="w-full text-base font-bold rounded-xl h-14 bg-slate-900 hover:bg-slate-800">
            Submit Answer
          </Button>
        ) : (
          <div className="space-y-4">
            <div className={cn("p-5 rounded-xl flex items-center gap-3 font-semibold", isCorrect ? "bg-green-100 text-green-800" : "bg-red-50 text-red-800 border border-red-100")}>
              {isCorrect ? (
                <>
                  <div className="bg-green-200 p-1.5 rounded-full"><CheckCircle2 className="w-5 h-5 text-green-700" /></div>
                  Excellent! That is the correct answer.
                </>
              ) : (
                <>
                  <div className="bg-red-100 p-1.5 rounded-full"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                  Incorrect. Let's understand why to avoid this mistake in the exam.
                </>
              )}
            </div>
            
            {/* Display Explanation & Metadata */}
            {currentQuestion?.explanation && (
              <div className="bg-secondary p-5 rounded-xl border border-border-subtle mt-4">
                <strong className="text-foreground text-base mb-2 block">Explanation</strong>
                <div className="space-y-2 mt-2">
                  {currentQuestion.explanation
                    .split(/(?=Step \d+:)/)
                    .map((step: string, i: number) => (
                      <p key={i} className="mb-0 text-muted-foreground text-sm leading-relaxed">{step.trim()}</p>
                    ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {currentQuestion.shortcut && (
                    <div className="p-3 bg-indigo-50/50 rounded-lg text-indigo-900 border border-indigo-100/50 text-sm">
                      <strong className="flex items-center gap-1.5 text-indigo-700 mb-1">
                        <Sparkles className="w-4 h-4" /> Shortcut
                      </strong> 
                      {currentQuestion.shortcut.replace(/Exam tip:.*$/i, '').trim()}
                    </div>
                  )}
                  
                  {(currentQuestion.exam_tip || (currentQuestion.shortcut && currentQuestion.shortcut.match(/Exam tip:(.*)$/i))) && (
                    <div className="p-3 bg-emerald-50/50 rounded-lg text-emerald-900 border border-emerald-100/50 text-sm">
                      <strong className="flex items-center gap-1.5 text-emerald-700 mb-1">
                        <span className="text-base leading-none">💡</span> Exam Tip
                      </strong> 
                      {currentQuestion.exam_tip || (currentQuestion.shortcut?.match(/Exam tip:(.*)$/i)?.[1]?.trim())}
                    </div>
                  )}
                  
                  {currentQuestion.common_mistake && !isCorrect && (
                    <div className="p-3 bg-red-50/50 rounded-lg text-red-900 border border-red-100/50 text-sm md:col-span-2">
                      <strong className="flex items-center gap-1.5 text-red-700 mb-1">
                        <span className="text-base leading-none">⚠️</span> Common Mistake
                      </strong> 
                      {currentQuestion.common_mistake}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Next Action */}
            {hasSubmitted && currentIndex < displayQuestions.length - 1 && (
              <div className="flex justify-end pt-4 animate-in fade-in duration-700">
                <Button size="lg" onClick={handleNext} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700">
                  Next Challenge <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
      )}
      
      
      {hasSubmitted && !isCorrect && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={() => useGlobalAIStore.getState().openChat()}>
            <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
            Open AI Assistant
          </Button>
        </div>
      )}

      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImportComplete={handleImportComplete} 
        contentType="practice" 
      />
    </div>
  );
}
