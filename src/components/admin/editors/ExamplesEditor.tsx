'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface Example {
  id: string;
  title: string;
  problem_statement: string;
  solution_steps: string;
  concept?: string;
  shortcut?: string;
  common_mistake?: string;
  exam_tip?: string;
  difficulty?: string;
}

interface ExamplesEditorProps {
  content: any[]; // Array of examples
  onChange: (content: any[]) => void;
}

export function ExamplesEditor({ content, onChange }: ExamplesEditorProps) {
  const [examples, setExamples] = useState<Example[]>(
    Array.isArray(content) && content.length > 0 
      ? content 
      : []
  );

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  useEffect(() => {
    onChange(examples);
  }, [examples, onChange]);

  const addExample = () => {
    const newExample: Example = {
      id: crypto.randomUUID(),
      title: '',
      problem_statement: '',
      solution_steps: '',
      difficulty: 'Medium'
    };
    setExamples([...examples, newExample]);
    setExpandedIndex(examples.length);
  };

  const updateExample = (index: number, updates: Partial<Example>) => {
    const updated = [...examples];
    updated[index] = { ...updated[index], ...updates };
    setExamples(updated);
  };

  const removeExample = (index: number) => {
    const updated = examples.filter((_, i) => i !== index);
    setExamples(updated);
    if (expandedIndex === index) setExpandedIndex(null);
  };

  return (
    <div className="space-y-4">
      {examples.map((ex, exIndex) => {
        const isExpanded = expandedIndex === exIndex;
        return (
          <div key={ex.id || exIndex} className="border border-border rounded-lg bg-white overflow-hidden shadow-sm">
            <div 
              className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer hover:bg-slate-100"
              onClick={() => setExpandedIndex(isExpanded ? null : exIndex)}
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm">
                  {exIndex + 1}
                </span>
                <span className="font-medium text-slate-800 line-clamp-1 flex-1">
                  {ex.title || 'New Example'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeExample(exIndex); }} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </div>

            {isExpanded && (
              <div className="p-5 border-t border-border space-y-6">
                
                {/* Meta Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input 
                      value={ex.title} 
                      onChange={e => updateExample(exIndex, { title: e.target.value })} 
                      placeholder="e.g. Ratio and Proportion Basic Problem" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Difficulty</Label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={ex.difficulty || 'Medium'}
                      onChange={(e) => updateExample(exIndex, { difficulty: e.target.value })}
                    >
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                </div>

                {/* Problem Body */}
                <div className="space-y-1.5">
                  <Label>Problem Statement</Label>
                  <RichTextEditor 
                    content={ex.problem_statement}
                    onChange={(val) => updateExample(exIndex, { problem_statement: val })}
                    className="min-h-[120px]"
                  />
                </div>

                {/* Solution Steps */}
                <div className="space-y-1.5">
                  <Label>Step-by-step Solution</Label>
                  <RichTextEditor 
                    content={ex.solution_steps}
                    onChange={(val) => updateExample(exIndex, { solution_steps: val })}
                    className="min-h-[200px]"
                  />
                </div>

                {/* Additional Tips */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Core Concept</Label>
                      <Input 
                        value={ex.concept || ''} 
                        onChange={(e) => updateExample(exIndex, { concept: e.target.value })}
                        placeholder="What concept is being tested?"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Shortcut / Trick</Label>
                      <Input 
                        value={ex.shortcut || ''} 
                        onChange={(e) => updateExample(exIndex, { shortcut: e.target.value })}
                        placeholder="Quick way to solve this"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Common Mistake</Label>
                      <Input 
                        value={ex.common_mistake || ''} 
                        onChange={(e) => updateExample(exIndex, { common_mistake: e.target.value })}
                        placeholder="What do students usually get wrong?"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Exam Tip</Label>
                      <Input 
                        value={ex.exam_tip || ''} 
                        onChange={(e) => updateExample(exIndex, { exam_tip: e.target.value })}
                        placeholder="Tip for TNPSC specifically"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        );
      })}

      <Button onClick={addExample} variant="outline" className="w-full border-dashed border-2 py-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200">
        <Plus className="w-5 h-5 mr-2" /> Add Example
      </Button>
    </div>
  );
}
