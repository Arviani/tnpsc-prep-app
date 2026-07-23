import React from 'react';
import { Lightbulb, AlertTriangle, Info, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CalloutType = 'tip' | 'warning' | 'info' | 'shortcut';

interface CalloutProps {
  type: CalloutType;
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type, title, children }: CalloutProps) {
  const styles = {
    tip: {
      container: 'bg-amber-50 border-amber-200',
      iconContainer: 'bg-amber-100 text-amber-600',
      title: 'text-amber-900',
      content: 'text-amber-800',
      icon: <Lightbulb className="w-5 h-5" />,
      defaultTitle: 'Expert Tip',
    },
    warning: {
      container: 'bg-red-50 border-red-200',
      iconContainer: 'bg-red-100 text-red-600',
      title: 'text-red-900',
      content: 'text-red-800',
      icon: <AlertTriangle className="w-5 h-5" />,
      defaultTitle: 'Common Trap',
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      iconContainer: 'bg-blue-100 text-blue-600',
      title: 'text-blue-900',
      content: 'text-blue-800',
      icon: <Info className="w-5 h-5" />,
      defaultTitle: 'Important Note',
    },
    shortcut: {
      container: 'bg-emerald-50 border-emerald-200',
      iconContainer: 'bg-emerald-100 text-emerald-600',
      title: 'text-emerald-900',
      content: 'text-emerald-800',
      icon: <Zap className="w-5 h-5" />,
      defaultTitle: 'Shortcut Method',
    },
  };

  const currentStyle = styles[type];

  return (
    <div className={cn("my-6 border rounded-xl p-5 shadow-sm flex items-start gap-4", currentStyle.container)}>
      <div className={cn("p-2 rounded-lg shrink-0 mt-0.5", currentStyle.iconContainer)}>
        {currentStyle.icon}
      </div>
      <div className="flex-1">
        <h4 className={cn("font-bold mb-1 text-base", currentStyle.title)}>
          {title || currentStyle.defaultTitle}
        </h4>
        <div className={cn("text-sm leading-relaxed", currentStyle.content)}>
          {children}
        </div>
      </div>
    </div>
  );
}
