"use client"

import React, { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { buildRevisionPrompt, RevisionAction } from '@/lib/ai/prompts/revision';
import { TopicContext } from '@/lib/ai/context';
import { AIActionButton } from '@/components/ai/AIActionButton';
import { AIResponseCard } from '@/components/ai/AIResponseCard';
import { AILoading } from '@/components/ai/AILoading';
import { AIError } from '@/components/ai/AIError';
import { FileText, List, BrainCircuit, Library, LayoutTemplate, Star, Sparkles, AlertCircle, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface RevisionClientProps {
  topicTitle: string;
  hasRevisionNotes: boolean;
}

export default function RevisionClient({ topicTitle, hasRevisionNotes }: RevisionClientProps) {
  const { workspace } = useWorkspace();
  const isAdmin = workspace === 'admin';
  const context: TopicContext = {
    subject: "Subject Name", // Needs to be passed if possible
    topic: topicTitle,
    currentTab: 'revision',
    exam: 'TNPSC Group 4',
    language: 'English',
    difficulty: 'Beginner',
    userRole: isAdmin ? 'admin' : 'student'
  };

  const { askAI, answer, isLoading, isError, error, retry } = useAI(context);
  const [activeAction, setActiveAction] = useState<RevisionAction | null>(null);

  const handleAIAction = (action: RevisionAction) => {
    setActiveAction(action);
    const prompt = buildRevisionPrompt(context, undefined, action);
    askAI(prompt);
  };

  if (!hasRevisionNotes) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-12 min-h-[500px]">
        {isAdmin ? (
          <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed border-border rounded-xl bg-slate-50/50 p-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
              <PenTool className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No revision notes available.</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md mb-6">
              There are no revision notes for this topic yet. Generate them using AI or write them manually.
            </p>
            <Button className="bg-amber-600 hover:bg-amber-700 shadow-sm text-white">
              <Sparkles className="w-4 h-4 mr-2" /> Generate Revision Notes
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed border-border rounded-xl bg-slate-50/50 p-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
              <AlertCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No revision notes available.</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md">
              There are no revision notes available for this topic right now. Please check back later.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-amber-100 mb-1">AI Revision Hub</div>
            <h2 className="text-3xl font-bold">{topicTitle}</h2>
          </div>
        </div>
        <p className="text-amber-50 text-base max-w-2xl relative z-10">
          Generate smart summaries, flashcards, and memory tricks tailored to help you retain information longer and recall it instantly during exams.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Actions Grid (Left) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-bold text-slate-900 text-lg mb-4">Generation Tools</h3>
          
          <div className="grid grid-cols-1 gap-3">
            <AIActionButton 
              label="Topic Summary" 
              icon={FileText}
              isActive={activeAction === 'summary'}
              onClick={() => handleAIAction('summary')}
              className="w-full h-14 text-sm justify-start rounded-xl px-5 border-slate-200 hover:border-amber-300 hover:bg-amber-50"
            />
            <AIActionButton 
              label="Bullet Notes" 
              icon={List}
              isActive={activeAction === 'bullet_notes'}
              onClick={() => handleAIAction('bullet_notes')}
              className="w-full h-14 text-sm justify-start rounded-xl px-5 border-slate-200 hover:border-amber-300 hover:bg-amber-50"
            />
            <AIActionButton 
              label="One-Page Revision" 
              icon={LayoutTemplate}
              isActive={activeAction === 'revision_sheet'}
              onClick={() => handleAIAction('revision_sheet')}
              className="w-full h-14 text-sm justify-start rounded-xl px-5 border-slate-200 hover:border-amber-300 hover:bg-amber-50"
            />
            <AIActionButton 
              label="Flashcards (Q&A)" 
              icon={Library}
              isActive={activeAction === 'flashcards'}
              onClick={() => handleAIAction('flashcards')}
              className="w-full h-14 text-sm justify-start rounded-xl px-5 border-slate-200 hover:border-amber-300 hover:bg-amber-50"
            />
            <AIActionButton 
              label="Memory Tricks" 
              icon={BrainCircuit}
              isActive={activeAction === 'memory_tricks'}
              onClick={() => handleAIAction('memory_tricks')}
              className="w-full h-14 text-sm justify-start rounded-xl px-5 border-slate-200 hover:border-amber-300 hover:bg-amber-50"
            />
            <AIActionButton 
              label="Exam Tips" 
              icon={Star}
              isActive={activeAction === 'exam_tips'}
              onClick={() => handleAIAction('exam_tips')}
              className="w-full h-14 text-sm justify-start rounded-xl px-5 border-amber-200 text-amber-700 bg-amber-50/50 hover:bg-amber-100 font-semibold"
            />
          </div>
        </div>

        {/* Content Area (Right) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full min-h-[500px] flex flex-col overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-900">Generated Material</h3>
            </div>
            
            <div className="p-6 flex-1 flex flex-col bg-slate-50/30">
              {isLoading && (
                <div className="flex-1 flex items-center justify-center">
                  <AILoading message="Compiling revision material..." />
                </div>
              )}
              {isError && error && (
                <div className="flex-1 flex items-center justify-center">
                  <AIError error={error} onRetry={retry} />
                </div>
              )}
              {!isLoading && !isError && answer && (
                <div className="animate-in fade-in zoom-in-95 duration-300 h-full">
                  <AIResponseCard content={answer} className="bg-white border border-slate-200 shadow-sm min-h-[400px] text-base p-8" />
                </div>
              )}
              {!isLoading && !isError && !answer && (
                <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto opacity-70">
                  <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10 text-amber-400" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Ready to Revise?</h4>
                  <p className="text-sm text-slate-500">
                    Select a tool from the left to generate customized study materials. Our AI will analyze the topic and create optimized notes for you.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
