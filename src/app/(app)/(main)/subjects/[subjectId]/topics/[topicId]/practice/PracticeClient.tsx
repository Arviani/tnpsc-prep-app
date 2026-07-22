"use client"

import React, { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { buildPracticePrompt, PracticeAction } from '@/lib/ai/prompts/practice';
import { TopicContext } from '@/lib/ai/context';
import { AIChatPanel } from '@/components/ai/AIChatPanel';
import { AIError } from '@/components/ai/AIError';
import { Button } from '@/components/ui/button';
import { HelpCircle, Zap, Crosshair, AlertTriangle, CheckCircle2, ArrowRight, PenTool, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface Option {
  id: string;
  body: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  body: string;
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

  const { askAI, answer, isLoading, isError, error, reset, retry } = useAI(context);
  const [activeAction, setActiveAction] = useState<PracticeAction | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleSave = async () => {
    if (!generatedQuestions) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/practice/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectId: subject.id,
          subjectName: subject.name,
          topicId: chapter.id,
          topicTitle: chapter.title,
          questions: generatedQuestions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save practice questions');
      }

      setGeneratedQuestions(null);
      router.refresh();
    } catch (err: any) {
      console.error('Error saving practice questions:', err);
      alert(err.message || 'An error occurred while saving practice questions');
    } finally {
      setIsSaving(false);
    }
  };

  const hasContent = questions && questions.length > 0;
  // If we have generated questions, display them as the current content
  const displayQuestions = generatedQuestions || questions;
  const currentQuestion = displayQuestions && displayQuestions.length > 0 ? displayQuestions[currentIndex] : null;
  const correctOption = currentQuestion?.options.find(o => o.is_correct);
  const isCorrect = selectedAnswerId === correctOption?.id;

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
      reset();
      setActiveAction(null);
    }
  };

  const handleAIAction = (action: PracticeAction) => {
    if (!currentQuestion) return;
    setActiveAction(action);
    const selectedOptionBody = currentQuestion.options.find(o => o.id === selectedAnswerId)?.body || "";
    const correctOptionBody = correctOption?.body || "";
    
    const prompt = buildPracticePrompt(
      context,
      currentQuestion.body, 
      currentQuestion.options.map(o => o.body), 
      selectedOptionBody, 
      correctOptionBody, 
      action
    );
    askAI(prompt);
  };

  if (!displayQuestions || displayQuestions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12 h-[calc(100vh-220px)] min-h-[500px]">
        {isAdmin ? (
          <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed border-border rounded-xl bg-slate-50/50 p-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
              <PenTool className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No practice questions available.</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md mb-6">
              There are no practice questions for this topic yet. Generate them using AI.
            </p>
            <Button onClick={handleGenerate} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
              <Sparkles className="w-4 h-4 mr-2" /> {isGenerating ? 'Generating...' : 'Generate Practice Questions'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed border-border rounded-xl bg-slate-50/50 p-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
              <AlertTriangle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No practice questions available.</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md">
              There are no practice questions available for this topic right now. Please check back later.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Question Card */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Question {currentIndex + 1} of {displayQuestions.length}
          </span>
          <span className="text-sm font-semibold text-slate-400 flex items-center gap-1"><HelpCircle className="w-4 h-4" /> Need Hint?</span>
        </div>
        
        <h2 className="text-xl font-bold text-slate-900 mb-8 leading-snug">{currentQuestion?.body}</h2>
        
        <div className="space-y-3 mb-8">
          {currentQuestion?.options.map((option) => {
            const isSelected = selectedAnswerId === option.id;
            const isCorrectOption = option.is_correct;
            
            let buttonClass = "w-full justify-start text-left h-auto py-4 px-5 text-base rounded-xl border-2 transition-all duration-200";
            if (!hasSubmitted) {
              buttonClass = cn(buttonClass, isSelected ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold shadow-sm" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700");
            } else {
              if (isCorrectOption) {
                buttonClass = cn(buttonClass, "border-green-500 bg-green-50 text-green-900 font-bold shadow-sm");
              } else if (isSelected && !isCorrectOption) {
                buttonClass = cn(buttonClass, "border-red-400 bg-red-50 text-red-900 font-semibold");
              } else {
                buttonClass = cn(buttonClass, "border-slate-100 bg-slate-50 text-slate-400 opacity-60");
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
        )}
      </div>

      {/* AI Assistant - Wrong Answer Analysis */}
      {hasSubmitted && !isCorrect && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[600px] flex flex-col">
          <AIChatPanel 
            context={context}
            actions={[
              { 
                label: 'Why is this wrong?', 
                icon: HelpCircle, 
                prompt: buildPracticePrompt(
                  context,
                  currentQuestion?.body || "",
                  currentQuestion?.options.map(o => o.body) || [],
                  currentQuestion?.options.find(o => o.id === selectedAnswerId)?.body || "",
                  correctOption?.body || "",
                  'why_wrong'
                ) 
              },
              { 
                label: 'Explain Concept', 
                icon: Zap, 
                prompt: buildPracticePrompt(
                  context,
                  currentQuestion?.body || "",
                  currentQuestion?.options.map(o => o.body) || [],
                  currentQuestion?.options.find(o => o.id === selectedAnswerId)?.body || "",
                  correctOption?.body || "",
                  'explain_concept'
                ) 
              },
              { 
                label: 'Shortcut trick', 
                icon: Crosshair, 
                prompt: buildPracticePrompt(
                  context,
                  currentQuestion?.body || "",
                  currentQuestion?.options.map(o => o.body) || [],
                  currentQuestion?.options.find(o => o.id === selectedAnswerId)?.body || "",
                  correctOption?.body || "",
                  'shortcut'
                ) 
              },
              { 
                label: 'Common Mistakes', 
                icon: AlertTriangle, 
                prompt: buildPracticePrompt(
                  context,
                  currentQuestion?.body || "",
                  currentQuestion?.options.map(o => o.body) || [],
                  currentQuestion?.options.find(o => o.id === selectedAnswerId)?.body || "",
                  correctOption?.body || "",
                  'common_mistakes'
                ) 
              }
            ]}
          />
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

      {/* Admin Review & Save Sticky Bar */}
      {isAdmin && generatedQuestions && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-50 flex justify-center items-center gap-4">
          <p className="text-sm font-medium text-slate-700 mr-4">Previewing {generatedQuestions.length} AI-generated questions</p>
          <Button variant="outline" onClick={() => setGeneratedQuestions(null)}>
            Discard
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
            {isSaving ? 'Saving...' : 'Approve & Save Questions'}
          </Button>
        </div>
      )}
    </div>
  );
}
