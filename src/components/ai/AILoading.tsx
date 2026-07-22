import React from 'react';
import { Loader2 } from 'lucide-react';

interface AILoadingProps {
  message?: string;
}

export function AILoading({ message = "AI is preparing your explanation..." }: AILoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-purple-600 gap-3 bg-purple-50/30 rounded-lg border border-purple-50">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
