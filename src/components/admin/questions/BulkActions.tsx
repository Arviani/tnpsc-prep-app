'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckSquare, Trash, Layers, Sparkles } from 'lucide-react'

export function BulkActions({ selectedIds, onClear }: { selectedIds: string[], onClear: () => void }) {
  if (selectedIds.length === 0) return null

  return (
    <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between shadow-lg sticky bottom-4 mx-4 rounded-xl animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-4">
        <span className="font-medium">{selectedIds.length} questions selected</span>
        <Button variant="secondary" size="sm" onClick={onClear} className="h-7 text-xs">Clear</Button>
      </div>
      
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary-foreground/20">
          <Layers className="w-4 h-4" /> Edit Subject/Chapter
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary-foreground/20">
          <Sparkles className="w-4 h-4" /> AI Metadata
        </Button>
        <div className="w-px h-4 bg-primary-foreground/20 my-auto mx-2" />
        <Button variant="ghost" size="sm" className="gap-2 hover:bg-destructive/90 hover:text-destructive-foreground text-red-200">
          <Trash className="w-4 h-4" /> Delete
        </Button>
      </div>
    </div>
  )
}
