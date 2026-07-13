import React from 'react'
import { Card } from '@/components/ui/card'
import { Zap, Sparkles } from 'lucide-react'

interface ModeSelectionProps {
  selectedMode: 'automatic' | 'ai' | null
  onSelect: (mode: 'automatic' | 'ai') => void
}

export function ModeSelection({ selectedMode, onSelect }: ModeSelectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto mb-8">
      <Card 
        className={`p-6 cursor-pointer border-2 transition-all hover:border-primary/50 ${selectedMode === 'automatic' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border'}`}
        onClick={() => onSelect('automatic')}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider">
            Free / No AI Credits
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2">Automatic Extract</h3>
        <p className="text-sm text-muted-foreground">
          Use for structured TNPSC question and answer files (e.g., .txt). Deterministic parser extracts questions, options, and metadata without using any AI credits.
        </p>
      </Card>

      <Card 
        className={`p-6 cursor-pointer border-2 transition-all hover:border-primary/50 ${selectedMode === 'ai' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border'}`}
        onClick={() => onSelect('ai')}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-purple-500/10 rounded-lg">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <span className="px-3 py-1 bg-purple-500/10 text-purple-600 rounded-full text-xs font-bold uppercase tracking-wider">
            Uses AI Credits
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2">AI Extract</h3>
        <p className="text-sm text-muted-foreground">
          Use Gemini Vision AI for scanned PDFs or unstructured question papers. Intelligently extracts questions even from difficult formats.
        </p>
      </Card>
    </div>
  )
}
