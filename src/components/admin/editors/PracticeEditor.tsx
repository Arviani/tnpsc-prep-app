'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

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
  common_mistake?: string;
  options: Option[];
}

interface PracticeEditorProps {
  content: any[]; // Array of questions
  onChange: (content: any[]) => void;
}

export function PracticeEditor({ content, onChange }: PracticeEditorProps) {
  const [questions, setQuestions] = useState<Question[]>(
    Array.isArray(content) && content.length > 0 
      ? content 
      : []
  );

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  useEffect(() => {
    onChange(questions);
  }, [questions, onChange]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      body: '',
      difficulty: 'Medium',
      question_type: 'MCQ',
      marks: 1,
      negative_marks: 0.25,
      explanation: '',
      options: [
        { id: crypto.randomUUID(), body: '', is_correct: true },
        { id: crypto.randomUUID(), body: '', is_correct: false },
        { id: crypto.randomUUID(), body: '', is_correct: false },
        { id: crypto.randomUUID(), body: '', is_correct: false }
      ]
    };
    setQuestions([...questions, newQuestion]);
    setExpandedIndex(questions.length);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const updateOption = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].body = text;
    setQuestions(updated);
  };

  const setCorrectOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.forEach((opt, i) => {
      opt.is_correct = i === oIndex;
    });
    setQuestions(updated);
  };

  return (
    <div className="space-y-4">
      {questions.map((q, qIndex) => {
        const isExpanded = expandedIndex === qIndex;
        return (
          <div key={q.id || qIndex} className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
            <div 
              className="flex items-center justify-between p-4 bg-secondary cursor-pointer hover:bg-accent"
              onClick={() => setExpandedIndex(isExpanded ? null : qIndex)}
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm">
                  {qIndex + 1}
                </span>
                <span className="font-medium text-foreground line-clamp-1 flex-1">
                  {q.body ? q.body.replace(/<[^>]*>?/gm, '').substring(0, 80) + '...' : 'New Question'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeQuestion(qIndex); }} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </div>
            </div>

            {isExpanded && (
              <div className="p-5 border-t border-border space-y-6">
                
                {/* Meta Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Difficulty</Label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={q.difficulty || 'Medium'}
                      onChange={(e) => updateQuestion(qIndex, { difficulty: e.target.value })}
                    >
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Type</Label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={q.question_type || 'MCQ'}
                      onChange={(e) => updateQuestion(qIndex, { question_type: e.target.value })}
                    >
                      <option>MCQ</option>
                      <option>True/False</option>
                      <option>Fill in the Blank</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Marks</Label>
                    <Input type="number" value={q.marks || 1} onChange={e => updateQuestion(qIndex, { marks: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Negative Marks</Label>
                    <Input type="number" step="0.1" value={q.negative_marks || 0.25} onChange={e => updateQuestion(qIndex, { negative_marks: Number(e.target.value) })} />
                  </div>
                </div>

                {/* Question Body */}
                <div className="space-y-1.5">
                  <Label>Question Text</Label>
                  <RichTextEditor 
                    content={q.body}
                    onChange={(val) => updateQuestion(qIndex, { body: val })}
                    className="min-h-[120px]"
                  />
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <Label>Options</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((opt, oIndex) => (
                      <div key={opt.id || oIndex} className={`flex items-start gap-3 p-3 rounded-md border ${opt.is_correct ? 'border-green-300 bg-green-50/30' : 'border-border bg-secondary'}`}>
                        <input 
                          type="radio" 
                          name={`q-${qIndex}-correct`} 
                          checked={opt.is_correct}
                          onChange={() => setCorrectOption(qIndex, oIndex)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">Option {String.fromCharCode(65 + oIndex)}</span>
                            {opt.is_correct && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Correct</span>}
                          </div>
                          <Input 
                            value={opt.body}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            placeholder="Option text..."
                            className="bg-card"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanations */}
                <div className="space-y-4 pt-4 border-t border-border-subtle">
                  <div className="space-y-1.5">
                    <Label>Explanation</Label>
                    <Textarea 
                      value={q.explanation || ''} 
                      onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                      placeholder="Why is this the correct answer?"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Shortcut / Trick</Label>
                      <Input 
                        value={q.shortcut || ''} 
                        onChange={(e) => updateQuestion(qIndex, { shortcut: e.target.value })}
                        placeholder="e.g. Remember BEDMAS"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Common Mistake</Label>
                      <Input 
                        value={q.common_mistake || ''} 
                        onChange={(e) => updateQuestion(qIndex, { common_mistake: e.target.value })}
                        placeholder="What do students usually get wrong?"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        );
      })}

      <Button onClick={addQuestion} variant="outline" className="w-full border-dashed border-2 py-8 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200">
        <Plus className="w-5 h-5 mr-2" /> Add Practice Question
      </Button>
    </div>
  );
}
