'use client';

import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

interface ExampleCardProps {
  children: React.ReactNode;
}

export function ExampleCard({ children }: ExampleCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-8 bg-card border border-indigo-100 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="bg-indigo-50/50 border-b border-indigo-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-1.5 rounded text-indigo-600">
            <FileText className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-indigo-900 m-0">Worked Example</h4>
        </div>
        <div className="flex gap-2">
          <span className="px-2.5 py-1 bg-card border border-border rounded-md text-xs font-semibold text-muted-foreground">
            TNPSC Group 4
          </span>
        </div>
      </div>
      
      <div className="p-6 space-y-4 text-foreground example-content">
        {children}
      </div>

      <div className="px-6 py-4 bg-secondary border-t border-border-subtle">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {isOpen ? 'Hide Solution Steps' : 'View Step-by-Step Solution'}
        </button>
        
        {isOpen && (
          <div className="mt-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Realistically, we would split children to show question vs solution. 
                But since we are wrapping raw markdown, we might just show everything for now,
                or we'll expect the markdown parser to split it. For simplicity in this iteration, 
                we might just wrap the whole example block or build a parser in RichMarkdownRenderer. */}
            <div className="bg-card p-5 rounded-xl border border-border-subtle shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-emerald-600 font-bold">
                <Lightbulb className="w-4 h-4" />
                Solution
              </div>
              <p className="text-sm text-muted-foreground italic">
                (Note: Since the source content is a single markdown block, the solution is currently integrated above. In a structured JSON format, the solution would appear here.)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
