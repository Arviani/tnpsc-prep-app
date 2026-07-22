"use client"

import React, { useState, useEffect } from 'react';
import { useGlobalAIStore } from '@/hooks/useGlobalAIStore';
import { buildStudyPrompt, StudyAction } from '@/lib/ai/prompts/study';
import { TopicContext } from '@/lib/ai/context';
import { AIError } from '@/components/ai/AIError';
import { Lightbulb, List, BrainCircuit, FileText, Languages, Sparkles, Save, Loader2, UploadCloud, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { LessonRenderer } from '@/components/ui/LessonRenderer';
import { CMSActionBar } from '@/components/admin/CMSActionBar';
import { RichTextEditor } from '@/components/admin/editors/RichTextEditor';
import { ImportModal } from '@/components/admin/ImportModal';

interface StudyClientProps {
  subject: { id: string, name: string };
  chapter: { id: string, title: string };
  lesson: { content: string, status?: string } | null;
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

  useEffect(() => {
    const store = useGlobalAIStore.getState();
    store.setContext(context);
    store.setActions([
      { label: 'Explain Simply', icon: Lightbulb, prompt: buildStudyPrompt(context, 'explain_simply', lesson?.content) },
      { label: 'Important Points', icon: List, prompt: buildStudyPrompt(context, 'exam_points', lesson?.content) },
      { label: 'Memory Tricks', icon: BrainCircuit, prompt: buildStudyPrompt(context, 'memory_tricks', lesson?.content) },
      { label: 'Flashcards', icon: FileText, prompt: buildStudyPrompt(context, 'flashcards', lesson?.content) },
      { label: 'Explain in Tamil', icon: Languages, prompt: buildStudyPrompt(context, 'explain_tamil', lesson?.content) },
    ]);
  }, [lesson]);

  const [activeAction, setActiveAction] = useState<StudyAction | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAIAction = (action: StudyAction) => {
    setActiveAction(action);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState(lesson?.content || '');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleImportComplete = (content: any, type: 'markdown' | 'json') => {
    if (type === 'markdown') {
      setEditorContent(content);
      setIsEditing(true);
    }
  };

  const handleSaveDraft = async () => {
    await saveContent('draft');
  };

  const handlePublish = async () => {
    await saveContent('published');
  };

  const saveContent = async (status: 'draft' | 'published') => {
    if (!editorContent) return;
    
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
          contentType: 'study',
          title: chapter.title,
          content: editorContent,
          status
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save lesson');
      }

      toast.success(status === 'published' ? 'Lesson published successfully!' : 'Draft saved!');
      setIsEditing(false);
      setActiveAction(null);
      router.refresh();
    } catch (err: any) {
      console.error('Error saving lesson:', err);
      toast.error(err.message || 'An error occurred while saving the lesson');
    } finally {
      setIsSaving(false);
    }
  };

  const hasContent = !!(lesson && lesson.content);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {isAdmin && (
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <CMSActionBar
            status={lesson?.status as any || (isEditing ? 'draft' : undefined)}
            hasContent={hasContent}
            isEditing={isEditing}
            isSaving={isSaving}
            onManualCreate={() => setIsEditing(true)}
            onAIGenerate={() => {
              setIsEditing(true);
              handleAIAction('explain_detail');
            }}
            onImport={() => setIsImportModalOpen(true)}
            onEdit={() => setIsEditing(true)}
            onPreview={() => setIsEditing(false)}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            onArchive={() => toast.info('Archiving...')}
            onDelete={() => toast.info('Deleting...')}
            onViewHistory={() => toast.info('Opening version history...')}
            className="rounded-none border-x-0 border-t-0 border-b-0 mb-0"
          />
        </div>
      )}
      
      <div className="w-full">
        {isEditing ? (
          <div className="bg-white rounded-xl border border-border p-6 lg:p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-foreground mb-4">{chapter.title}</h1>
            <RichTextEditor 
              content={editorContent} 
              onChange={setEditorContent} 
            />
          </div>
        ) : hasContent ? (
          <LessonRenderer content={lesson.content} title={chapter.title} />
        ) : isAdmin ? (
          <div className="bg-white rounded-xl border border-border flex flex-col items-center justify-center h-[350px] text-center p-8 shadow-sm">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No lesson available.</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md mb-6">
                There is currently no pre-written lesson content for this topic in the database. Generate or import content to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => { setIsEditing(true); handleAIAction('explain_detail'); }} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                  <Sparkles className="w-4 h-4 mr-2" /> Generate with AI
                </Button>
                <Button onClick={() => setIsEditing(true)} variant="outline" className="shadow-sm">
                  <PenTool className="w-4 h-4 mr-2 text-slate-500" /> Write Manually
                </Button>
                <Button onClick={() => setIsImportModalOpen(true)} variant="outline" className="shadow-sm">
                  <UploadCloud className="w-4 h-4 mr-2 text-slate-500" /> Import Lesson
                </Button>
              </div>
            </div>
          ) : (
          <div className="bg-white rounded-xl border border-border flex flex-col items-center justify-center h-[350px] text-center p-8 shadow-sm">
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
      
      <div className="flex justify-center mt-4">
        <Button variant="outline" onClick={() => useGlobalAIStore.getState().openChat()}>
          <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
          Open AI Assistant
        </Button>
      </div>

      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImportComplete={handleImportComplete} 
        contentType="study" 
      />
    </div>
  );
}
