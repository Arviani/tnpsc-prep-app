import React from 'react'
import { CheckCircle2, XCircle, FileWarning } from 'lucide-react'
import { ImportSummaryResult } from '@/actions/import.action'

interface ImportSummaryProps {
  result: ImportSummaryResult
  onNewImport: () => void
}

export function ImportSummary({ result, onNewImport }: ImportSummaryProps) {
  return (
    <div className="max-w-2xl mx-auto mt-12 border rounded-xl bg-card p-12 text-center shadow-sm">
      <div className="flex justify-center mb-6">
        {result.success ? (
          <CheckCircle2 className="h-20 w-20 text-green-500" />
        ) : result.imported > 0 ? (
          <FileWarning className="h-20 w-20 text-yellow-500" />
        ) : (
          <XCircle className="h-20 w-20 text-destructive" />
        )}
      </div>
      
      <h2 className="text-3xl font-bold mb-4">
        {result.success ? 'Import Complete!' : result.imported > 0 ? 'Partial Import Complete' : 'Import Failed'}
      </h2>
      
      {result.error && (
        <p className="text-destructive mb-6 max-w-md mx-auto">{result.error}</p>
      )}

      <div className="grid grid-cols-2 gap-6 max-w-md mx-auto mb-10">
        <div className="bg-muted rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-foreground mb-1">{result.imported}</div>
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Imported</div>
        </div>
        <div className="bg-muted rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-foreground mb-1">{result.failed}</div>
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Failed</div>
        </div>
      </div>

      <button
        onClick={onNewImport}
        className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
      >
        Import Another File
      </button>
    </div>
  )
}
