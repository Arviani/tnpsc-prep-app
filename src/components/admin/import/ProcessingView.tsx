import React from 'react'
import { Loader2, BrainCircuit, UploadCloud } from 'lucide-react'

interface ProcessingViewProps {
  state: 'uploading_file' | 'processing_ai'
  filename?: string
}

export function ProcessingView({ state, filename }: ProcessingViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] border rounded-xl bg-card p-12 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
        <div className="relative h-24 w-24 bg-card border shadow-xl rounded-2xl flex items-center justify-center">
          {state === 'uploading_file' ? (
            <UploadCloud className="h-10 w-10 text-primary animate-pulse" />
          ) : (
            <BrainCircuit className="h-10 w-10 text-primary animate-pulse" />
          )}
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-2">
        {state === 'uploading_file' ? 'Uploading File' : 'Extracting Questions'}
      </h3>
      
      <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
        {state === 'uploading_file' 
          ? `Securely uploading ${filename || 'your file'} to storage...` 
          : 'Gemini Vision AI is analyzing the document structure and extracting questions, options, and metadata...'}
      </p>

      <div className="flex items-center gap-3 text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-full">
        <Loader2 className="h-4 w-4 animate-spin" />
        {state === 'uploading_file' ? 'Uploading...' : 'Processing with Gemini 2.5 Flash'}
      </div>
    </div>
  )
}
