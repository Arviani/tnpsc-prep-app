'use client';

import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TOCHeading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: TOCHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first intersecting element and set it as active
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Update active immediately on click for better UX
      setActiveId(id);
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h3 className="text-[13px] font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
        <FileText className="w-4 h-4 text-slate-400" />
        Table of Contents
      </h3>
      <ul className="space-y-1.5 list-none m-0 p-0">
        {headings.map((heading, idx) => (
          <li 
            key={idx} 
            style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
          >
            <a 
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={cn(
                "text-[14px] font-medium no-underline transition-colors block py-1.5 px-2 rounded-md",
                activeId === heading.id 
                  ? "text-indigo-600 bg-indigo-50" 
                  : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
