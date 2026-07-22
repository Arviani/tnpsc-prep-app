"use client"

import React, { useState, useEffect } from 'react';
import { useGlobalAIStore } from '@/hooks/useGlobalAIStore';
import { TopicContext } from '@/lib/ai/context';
import { buildExampleActionPrompt } from '@/lib/ai/prompts/examples';
import { Lightbulb, List, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CMSActionBar } from '@/components/admin/CMSActionBar';
import { ExamplesEditor } from '@/components/admin/editors/ExamplesEditor';
import { ImportModal } from '@/components/admin/ImportModal';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface Example {
  id: string;
  question_text?: string;
  problem_statement?: string;
  step_by_step_solution?: string;
  solution_steps?: string;
  explanation?: string | null;
  shortcut?: string | null;
  exam_tip?: string | null;
  common_mistake?: string | null;
}

interface ExamplesClientProps {
  subject: { id: string, name: string };
  chapter: { id: string, title: string };
  examples: Example[];
}

export default function ExamplesClient({ subject, chapter, examples }: ExamplesClientProps) {
  const { workspace } = useWorkspace();
  const isAdmin = workspace === 'admin';
  const context: TopicContext = {
    subject: subject.name,
    topic: chapter.title,
    currentTab: 'examples',
    exam: 'TNPSC Group 4',
    language: 'English',
    difficulty: 'Beginner',
    userRole: isAdmin ? 'admin' : 'student'
  };

  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const store = useGlobalAIStore.getState();
    store.setContext(context);
    store.setActions([]);
  }, [chapter.title]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedExamples, setGeneratedExamples] = useState<Example[] | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/admin/examples/generate', {
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
        throw new Error(data.error || 'Failed to generate examples');
      }

      setGeneratedExamples(data.examples);
      // Auto-expand all solutions for preview
      const initialShowState: Record<string, boolean> = {};
      data.examples.forEach((ex: Example, i: number) => {
        // Assign temp IDs if none exist
        if (!ex.id) ex.id = `temp-${i}`;
        initialShowState[ex.id] = true;
      });
      setShowSolution(initialShowState);
    } catch (err: any) {
      console.error('Error generating examples:', err);
      alert(err.message || 'An error occurred while generating examples');
    } finally {
      setIsGenerating(false);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editorExamples, setEditorExamples] = useState<any[]>(examples || []);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleImportComplete = (content: any, type: 'markdown' | 'json') => {
    if (type === 'json') {
      const formattedExamples = (content as any[]).map(row => ({
        id: crypto.randomUUID(),
        title: row.Title || row.title || '',
        problem_statement: row.Problem || row.Question || row.body || row.problem_statement || row.question_text || '',
        solution_steps: row.Solution || row.Steps || row.solution_steps || row.step_by_step_solution || row.explanation || '',
        explanation: row.Explanation || row.explanation || '',
        concept: row.Concept || row.concept || '',
        shortcut: row.Shortcut || row.shortcut || '',
        common_mistake: row.Mistake || row.common_mistake || '',
        exam_tip: row.Tip || row.exam_tip || '',
        difficulty: row.Difficulty || row.difficulty || 'Medium'
      }));
      setEditorExamples([...editorExamples, ...formattedExamples]);
      setIsEditing(true);
    }
  };

  // Update editor if examples prop changes
  React.useEffect(() => {
    if (!isEditing) {
      setEditorExamples(examples || []);
    }
  }, [examples, isEditing]);

  const handleSaveDraft = async () => {
    await saveContent('draft');
  };

  const handlePublish = async () => {
    await saveContent('published');
  };

  const saveContent = async (status: 'draft' | 'published') => {
    if (!editorExamples || editorExamples.length === 0) return;
    
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
          contentType: 'examples',
          title: chapter.title,
          content: editorExamples,
          status
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save examples');
      }

      toast.success(status === 'published' ? 'Examples published successfully!' : 'Draft saved!');
      setIsEditing(false);
      setGeneratedExamples(null);
      router.refresh();
    } catch (err: any) {
      console.error('Error saving examples:', err);
      toast.error(err.message || 'An error occurred while saving examples');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIAction = (action: 'explain_simply' | 'similar_example' | 'identify_tricks', example: Example) => {
    setActiveAction(action);
    const qText = example.problem_statement || example.question_text || '';
    const sText = example.solution_steps || example.step_by_step_solution || '';
    const prompt = buildExampleActionPrompt(context, qText, sText, action);
    useGlobalAIStore.getState().setCurrentPrompt(prompt);
    useGlobalAIStore.getState().openChat();
  };

  const toggleSolution = (id: string) => {
    setShowSolution(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const hasContent = examples && examples.length > 0;
  const displayExamples = generatedExamples || examples;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      {/* Main Content Area */}
      <div className="flex-1 w-full min-h-[500px] border border-border flex flex-col shadow-sm h-full overflow-hidden">
        {isAdmin && (
          <CMSActionBar
            hasContent={hasContent}
            isEditing={isEditing}
            isSaving={isSaving}
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
            className="rounded-none border-x-0 border-t-0 mb-0"
          />
        )}
        
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
          <h1 className="text-2xl font-bold text-foreground">{chapter.title} - Worked Examples</h1>
          
          {isEditing ? (
            <ExamplesEditor 
              content={generatedExamples || editorExamples} 
              onChange={setEditorExamples} 
            />
          ) : displayExamples && displayExamples.length > 0 ? (
            <div className="space-y-8 pb-20">
              {displayExamples.map((example, index) => (
                <div key={example.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-slate-50 border-b border-slate-200 p-4 font-semibold text-slate-800 flex items-start gap-3">
                    <div className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                      {index + 1}
                    </div>
                    <div className="pt-1">{example.problem_statement || example.question_text}</div>
                  </div>
                  
                  {showSolution[example.id] ? (
                    <div className="p-5 bg-white">
                      <div className="prose prose-sm max-w-none text-slate-600 mb-6">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                          <strong className="text-slate-800 text-base mb-2 block">Step-by-Step Solution</strong>
                          <div className="space-y-2">
                            {(example.solution_steps || example.step_by_step_solution || '')
                              .split(/(?=Step \d+:)/)
                              .map((step, i) => (
                                <p key={i} className="mb-0 leading-relaxed text-slate-700">{step.trim()}</p>
                              ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {example.shortcut && (
                            <div className="p-3 bg-indigo-50/50 rounded-lg text-indigo-900 border border-indigo-100/50">
                              <strong className="flex items-center gap-1.5 text-indigo-700 mb-1">
                                <Sparkles className="w-4 h-4" /> Shortcut
                              </strong> 
                              {example.shortcut.replace(/Exam tip:.*$/i, '').trim()}
                            </div>
                          )}
                          
                          {(example.exam_tip || (example.shortcut && example.shortcut.match(/Exam tip:(.*)$/i))) && (
                            <div className="p-3 bg-emerald-50/50 rounded-lg text-emerald-900 border border-emerald-100/50">
                              <strong className="flex items-center gap-1.5 text-emerald-700 mb-1">
                                <span className="text-lg leading-none">💡</span> Exam Tip
                              </strong> 
                              {example.exam_tip || (example.shortcut?.match(/Exam tip:(.*)$/i)?.[1]?.trim())}
                            </div>
                          )}

                          {example.common_mistake && (
                            <div className="p-3 bg-red-50/50 rounded-lg text-red-900 border border-red-100/50 md:col-span-2">
                              <strong className="flex items-center gap-1.5 text-red-700 mb-1">
                                <span className="text-lg leading-none">⚠️</span> Common Mistake
                              </strong> 
                              {example.common_mistake}
                            </div>
                          )}
                        </div>

                        {example.explanation && example.explanation !== (example.solution_steps || example.step_by_step_solution) && (
                          <div className="mt-4 p-3 bg-slate-50 rounded-lg text-slate-700 border border-slate-200">
                            <strong>Note:</strong> {example.explanation}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        <Button variant="outline" size="sm" onClick={() => toggleSolution(example.id)}>
                          <EyeOff className="w-4 h-4 mr-2" /> Hide Solution
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleAIAction('explain_simply', example)} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                          <Sparkles className="w-4 h-4 mr-2" /> Explain Simply
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-white flex justify-center">
                      <Button variant="outline" onClick={() => toggleSolution(example.id)} className="w-full max-w-xs">
                        <Eye className="w-4 h-4 mr-2" /> View Solution
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : isAdmin ? (
            <div className="flex flex-col items-center justify-center h-[350px] text-center border-2 border-dashed border-border rounded-xl bg-slate-50/50 p-8">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                <List className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No worked examples available.</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md mb-6">
                There are no examples created for this topic yet. Generate them using AI or add them manually.
              </p>
              <Button onClick={handleGenerate} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                <Sparkles className="w-4 h-4 mr-2" /> {isGenerating ? 'Generating...' : 'Generate Examples'}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[350px] text-center border-2 border-dashed border-border rounded-xl bg-slate-50/50 p-8">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No worked examples available.</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md">
                There are no worked examples available for this topic right now. Please check back later.
              </p>
            </div>
          )}
        </div>
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
        contentType="examples" 
      />
    </div>
  );
}
