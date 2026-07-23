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
      className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden scroll-mt-24"
    >
      <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-3 bg-secondary/30">
        {icon && (
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            {icon}
          </div>
        )}
        <h2 className="text-2xl font-bold text-foreground m-0">{title}</h2>
      </div>
      
      <div className="p-5">
        <RichMarkdownRenderer content={content} />
      </div>
    </section>
  );
}
