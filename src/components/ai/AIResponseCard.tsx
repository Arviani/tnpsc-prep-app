import React from 'react';
import { cn } from '@/lib/utils';

interface AIResponseCardProps {
  content: string;
  className?: string;
}

export function AIResponseCard({ content, className }: AIResponseCardProps) {
  return (
    <div className={cn("bg-purple-50/50 p-4 rounded-lg text-sm text-gray-800 whitespace-pre-wrap leading-relaxed", className)}>
      {content}
    </div>
  );
}
