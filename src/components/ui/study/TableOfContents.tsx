'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollSpy } from './hooks/useScrollSpy';
import { useReadingProgress } from './hooks/useReadingProgress';

export interface TOCHeading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: TOCHeading[];
}

interface TreeNode extends TOCHeading {
  children: TreeNode[];
}

function buildTree(headings: TOCHeading[]): TreeNode[] {
  const tree: TreeNode[] = [];
  const stack: TreeNode[] = [];

  headings.forEach((heading) => {
    const node: TreeNode = { ...heading, children: [] };
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }
    if (stack.length > 0) {
      stack[stack.length - 1].children.push(node);
    } else {
      tree.push(node);
    }
    stack.push(node);
  });

  return tree;
}

const TOCNode = ({
  node,
  activeId,
  onItemClick,
}: {
  node: TreeNode;
  activeId: string;
  onItemClick: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}) => {
  const itemRef = useRef<HTMLLIElement>(null);

  const hasActiveChild = (n: TreeNode): boolean => {
    if (n.id === activeId) return true;
    return n.children.some(hasActiveChild);
  };

  const isActive = node.id === activeId;
  const isActiveTree = hasActiveChild(node);
  const isExpanded = isActiveTree; // Automatically expand if it contains the active item

  // Auto-scroll TOC to keep active item in view
  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [isActive]);

  return (
    <li ref={itemRef} className="flex flex-col">
      <a
        href={`#${node.id}`}
        onClick={(e) => onItemClick(e, node.id)}
        className={cn(
          "group flex items-center justify-between text-[14px] font-medium no-underline transition-all duration-200 block py-1.5 px-3 rounded-md mb-0.5",
          isActive
            ? "text-indigo-700 bg-indigo-50 font-semibold"
            : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
        )}
        aria-current={isActive ? 'true' : undefined}
      >
        <span className="flex items-center gap-2 relative w-full">
          {/* Indicator bar for active item */}
          {isActive && (
            <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-4 bg-indigo-600 rounded-r-full transition-all duration-200" />
          )}
          <span className="truncate">{node.text}</span>
        </span>
        {node.children.length > 0 && (
          <ChevronRight
            className={cn(
              "w-4 h-4 text-slate-400 transition-transform duration-200",
              isExpanded ? "rotate-90" : ""
            )}
          />
        )}
      </a>
      
      {node.children.length > 0 && (
        <div
          className={cn(
            "grid transition-all duration-200 ease-in-out",
            isExpanded ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <ul className="overflow-hidden list-none m-0 p-0 pl-3 ml-2 border-l border-slate-100 space-y-0.5">
            {node.children.map((child) => (
              <TOCNode
                key={child.id}
                node={child}
                activeId={activeId}
                onItemClick={onItemClick}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

export function TableOfContents({ headings }: TableOfContentsProps) {
  const ids = useMemo(() => headings.map((h) => h.id), [headings]);
  const activeId = useScrollSpy(ids);
  const readingProgress = useReadingProgress();

  const tree = useMemo(() => buildTree(headings), [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Offset for sticky header (assuming header is ~80px)
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
      // The IntersectionObserver in useScrollSpy will naturally update the activeId
      // and history.replaceState as the page scrolls.
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
        
        {/* Reading Progress */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-indigo-500 rounded-full transition-all duration-150 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
        <div className="flex justify-end">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {Math.round(readingProgress)}% Read
          </span>
        </div>
      </div>

      <div className="overflow-y-auto -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pb-4">
        <ul className="space-y-0.5 list-none m-0 p-0">
          {tree.map((node) => (
            <TOCNode 
              key={node.id} 
              node={node} 
              activeId={activeId} 
              onItemClick={handleClick} 
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
