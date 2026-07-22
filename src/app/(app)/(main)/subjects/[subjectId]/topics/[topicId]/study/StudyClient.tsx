"use client"

import React, { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { buildStudyPrompt, StudyAction } from '@/lib/ai/prompts/study';
import { TopicContext } from '@/lib/ai/context';
import { AIChatPanel } from '@/components/ai/AIChatPanel';
import { AIError } from '@/components/ai/AIError';
import { Lightbulb, List, BrainCircuit, FileText, Languages, Sparkles, Save, Loader2, UploadCloud, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { LessonRenderer } from '@/components/ui/LessonRenderer';

interface StudyClientProps {
  subject: { id: string, name: string };
  chapter: { id: string, title: string };
  lesson: { content: string } | null;
}

export default function StudyClient({ subject, chapter, lesson }: StudyClientProps) {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const isAdmin = workspace === 'admin';
  const context: TopicContext = {
    subject: subject.name,
    topic: chapter.title,
    currentTab: 'study',
    exam: 'TNPSC Group 4',
    language: 'English',
    difficulty: 'Beginner',
    userRole: isAdmin ? 'admin' : 'student'
  };

  const { askAI, answer, isLoading, isError, error, reset, retry } = useAI(context);
  const [activeAction, setActiveAction] = useState<StudyAction | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAIAction = (action: StudyAction) => {
    setActiveAction(action);
    const existingContent = lesson?.content || '';
    const prompt = buildStudyPrompt(context, action, existingContent);
    askAI(prompt);
  };

  const handleSaveLesson = async () => {
    if (!answer || activeAction !== 'explain_detail') return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/lessons/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectId: subject.id,
          topicId: chapter.id,
          title: chapter.title,
          content: answer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save lesson');
      }

      toast.success('Lesson saved successfully!');
      reset();
      setActiveAction(null);
      router.refresh();
    } catch (err: any) {
      console.error('Error saving lesson:', err);
      toast.error(err.message || 'An error occurred while saving the lesson');
    } finally {
      setIsSaving(false);
    }
  };

  const hasContent = lesson && lesson.content;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-220px)] min-h-[500px]">
      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-xl border border-border flex flex-col shadow-sm h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <h1 className="text-2xl font-bold text-foreground mb-4">{chapter.title}</h1>
          {hasContent ? (
            <LessonRenderer content={lesson.content} />
          ) : isAdmin ? (
          <div className="flex flex-col items-center justify-center h-[350px] text-center border-2 border-dashed border-border rounded-xl bg-slate-50/50 p-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
              <Sparkles className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No lesson available.</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md mb-6">
              There is currently no pre-written lesson content for this topic in the database. Generate or import content to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => handleAIAction('explain_detail')} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                <Sparkles className="w-4 h-4 mr-2" /> Generate with AI
              </Button>
              <Button variant="outline" className="shadow-sm">
                <PenTool className="w-4 h-4 mr-2 text-slate-500" /> Write Manually
              </Button>
              <Button variant="outline" className="shadow-sm">
                <UploadCloud className="w-4 h-4 mr-2 text-slate-500" /> Import Lesson
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[350px] text-center border-2 border-dashed border-border rounded-xl bg-slate-50/50 p-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
              <Sparkles className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No lesson available.</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md">
              There is currently no pre-written lesson content for this topic in the database.
            </p>
            <p className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full mt-4">
              Use the AI Assistant on the right to learn dynamically
            </p>
          </div>
        )}
        </div>
        {/* Sticky Footer for Save Button */}
        {isAdmin && activeAction === 'explain_detail' && !hasContent && answer && (
          <div className="sticky bottom-0 w-full bg-white border-t border-border p-4 flex justify-end shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <Button 
              onClick={handleSaveLesson} 
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Save as Official Lesson</>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* AI Assistant Sidebar */}
      <div className="w-full lg:w-[380px] shrink-0 h-full flex flex-col">
        <AIChatPanel 
          context={context}
          actions={[
            { label: 'Explain Simply', icon: Lightbulb, prompt: buildStudyPrompt(context, 'explain_simply', lesson?.content) },
            { label: 'Important Points', icon: List, prompt: buildStudyPrompt(context, 'exam_points', lesson?.content) },
            { label: 'Memory Tricks', icon: BrainCircuit, prompt: buildStudyPrompt(context, 'memory_tricks', lesson?.content) },
            { label: 'Flashcards', icon: FileText, prompt: buildStudyPrompt(context, 'flashcards', lesson?.content) },
            { label: 'Explain in Tamil', icon: Languages, prompt: buildStudyPrompt(context, 'explain_tamil', lesson?.content) },
          ]}
        />
      </div>
    </div>
  );
}
