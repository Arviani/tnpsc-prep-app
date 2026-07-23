import React from 'react';
import { RichMarkdownRenderer } from './RichMarkdownRenderer';

interface ContentSectionProps {
  id: string;
  title: string;
  content: string;
  icon?: React.ReactNode;
}

export function ContentSection({ id, title, content, icon }: ContentSectionProps) {
  return (
    <section 
      id={id} 
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden scroll-mt-24"
    >
      <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
        {icon && (
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            {icon}
          </div>
        )}
        <h2 className="text-2xl font-bold text-slate-800 m-0">{title}</h2>
      </div>
      
      <div className="p-8">
        <RichMarkdownRenderer content={content} />
      </div>
    </section>
  );
}
