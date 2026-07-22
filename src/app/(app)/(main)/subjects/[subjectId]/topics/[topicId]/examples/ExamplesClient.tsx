"use client"

import React, { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { AIChatPanel } from '@/components/ai/AIChatPanel';
import { TopicContext } from '@/lib/ai/context';
import { buildExampleActionPrompt } from '@/lib/ai/prompts/examples';
import { Lightbulb, List, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useRouter } from 'next/navigation';

interface Example {
  id: string;
  question_text: string;
  step_by_step_solution: string;
  explanation?: string | null;
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

  const { askAI, answer, isLoading, isError, error, reset, retry } = useAI(context);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});

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

  const handleSave = async () => {
    if (!generatedExamples) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/examples/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectId: subject.id,
          topicId: chapter.id,
          examples: generatedExamples,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save examples');
      }

      setGeneratedExamples(null);
      router.refresh();
    } catch (err: any) {
      console.error('Error saving examples:', err);
      alert(err.message || 'An error occurred while saving examples');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIAction = (action: 'explain_simply' | 'similar_example' | 'identify_tricks', example: Example) => {
    setActiveAction(action);
    const prompt = buildExampleActionPrompt(context, example.question_text, example.step_by_step_solution, action);
    askAI(prompt);
  };

  const toggleSolution = (id: string) => {
    setShowSolution(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const hasContent = examples && examples.length > 0;
  const displayExamples = generatedExamples || examples;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-220px)] min-h-[500px]">
      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-xl border border-border flex flex-col shadow-sm h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
          <h1 className="text-2xl font-bold text-foreground">{chapter.title} - Worked Examples</h1>
          
          {displayExamples && displayExamples.length > 0 ? (
            <div className="space-y-8 pb-20">
              {displayExamples.map((example, index) => (
                <div key={example.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-slate-50 border-b border-slate-200 p-4 font-semibold text-slate-800 flex items-start gap-3">
                    <div className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                      {index + 1}
                    </div>
                    <div className="pt-1">{example.question_text}</div>
                  </div>
                  
                  {showSolution[example.id] ? (
                    <div className="p-5 bg-white">
                      <div className="prose prose-sm max-w-none text-slate-600 mb-4 whitespace-pre-wrap">
                        <strong className="text-slate-800">Step-by-Step Solution:</strong><br/>
                        {example.step_by_step_solution}
                        {example.explanation && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-blue-800 border border-blue-100">
                            <strong>Explanation:</strong> {example.explanation}
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

      {/* AI Assistant Sidebar */}
      <div className="w-full lg:w-[380px] shrink-0 h-full flex flex-col">
        <AIChatPanel 
          context={context}
          actions={[]}
        />
      </div>

      {/* Admin Review & Save Sticky Bar */}
      {isAdmin && generatedExamples && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-50 flex justify-center items-center gap-4">
          <p className="text-sm font-medium text-slate-700 mr-4">Previewing {generatedExamples.length} AI-generated examples</p>
          <Button variant="outline" onClick={() => setGeneratedExamples(null)}>
            Discard
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
            {isSaving ? 'Saving...' : 'Approve & Save Examples'}
          </Button>
        </div>
      )}
    </div>
  );
}
