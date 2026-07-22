import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIErrorProps {
  error: Error;
  onRetry?: () => void;
}

export function AIError({ error, onRetry }: AIErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 text-red-600 gap-3 bg-red-50/50 rounded-lg border border-red-100 text-center">
      <AlertCircle className="w-6 h-6 text-red-500" />
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-red-800">Something went wrong</h4>
        <p className="text-xs text-red-700">{error.message || "Failed to generate AI response."}</p>
      </div>
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="mt-2 text-xs h-7 border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
        >
          <RefreshCcw className="w-3 h-3 mr-1.5" />
          Retry
        </Button>
      )}
    </div>
  );
}
