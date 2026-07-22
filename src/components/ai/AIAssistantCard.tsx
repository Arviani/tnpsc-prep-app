import React from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIAssistantCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function AIAssistantCard({ title = "AI Learning Assistant", children, className }: AIAssistantCardProps) {
  return (
    <Card className={cn("overflow-hidden border border-purple-100 shadow-sm rounded-xl bg-white", className)}>
      <div className="flex items-center gap-2 px-3 py-2 bg-purple-50/50 border-b border-purple-100">
        <Sparkles className="w-4 h-4 text-purple-600" />
        <h3 className="font-semibold text-sm text-purple-900">{title}</h3>
      </div>
      {children}
    </Card>
  );
}
