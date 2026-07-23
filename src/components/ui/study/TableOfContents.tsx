'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollSpy } from './hooks/useScrollSpy';

export interface TOCHeading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: TOCHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const ids = useMemo(() => headings.map((h) => h.id), [headings]);
  const activeId = useScrollSpy(ids);
  
  // We want to scroll to the active item in the TOC so it stays visible
  const activeItemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (activeId && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [activeId]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm max-h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h3 className="text-[13px] font-bold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
          <FileText className="w-4 h-4 text-slate-400" />
          Table of Contents
        </h3>
      </div>

      <div className="overflow-y-auto -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pb-4">
        <ul className="space-y-0.5 list-none m-0 p-0">
          {headings.filter(h => h.level <= 2).map((heading, idx) => {
            const isActive = activeId === heading.id;
            return (
              <li 
                key={idx} 
                ref={isActive ? activeItemRef : null}
                className="flex flex-col"
              >
                <a 
                  href={`#${heading.id}`}
                  onClick={(e) => handleClick(e, heading.id)}
                  className={cn(
                    "group flex items-center justify-between text-[14px] font-medium no-underline transition-all duration-200 block py-1.5 px-3 rounded-md mb-0.5",
                    isActive 
                      ? "text-indigo-700 bg-indigo-50 font-semibold" 
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                  )}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <span className="flex items-center gap-2 relative w-full">
                    {isActive && (
                      <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-4 bg-indigo-600 rounded-r-full transition-all duration-200" />
                    )}
                    <span className="truncate">{heading.text}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
