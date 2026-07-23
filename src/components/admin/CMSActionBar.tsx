'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  PenTool, 
  Sparkles, 
  UploadCloud, 
  Copy, 
  Eye, 
  Save, 
  Send, 
  Archive, 
  Trash2,
  MoreVertical,
  History
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface CMSActionBarProps {
  status?: 'draft' | 'review' | 'published' | 'archived';
  onManualCreate?: () => void;
  onAIGenerate?: () => void;
  onImport?: () => void;
  onDuplicate?: () => void;
  onEdit?: () => void;
  onPreview?: () => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onViewHistory?: () => void;
  isEditing?: boolean;
  isSaving?: boolean;
  isValidating?: boolean;
  hasContent?: boolean;
  className?: string;
}

export function CMSActionBar({
  status,
  onManualCreate,
  onAIGenerate,
  onImport,
  onDuplicate,
  onEdit,
  onPreview,
  onSaveDraft,
  onPublish,
  onArchive,
  onDelete,
  onViewHistory,
  isEditing = false,
  isSaving = false,
  isValidating = false,
  hasContent = false,
  className
}: CMSActionBarProps) {

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 p-3 bg-card border border-border rounded-lg shadow-sm mb-4", className)}>
      
      <div className="flex items-center gap-2">
        {status && (
          <span className={cn(
            "px-2.5 py-1 text-xs font-semibold rounded-full border",
            status === 'published' ? "bg-green-50 text-green-700 border-green-200" :
            status === 'draft' ? "bg-amber-50 text-amber-700 border-amber-200" :
            status === 'review' ? "bg-blue-50 text-blue-700 border-blue-200" :
            "bg-accent text-foreground border-border"
          )}>
            {status.toUpperCase()}
          </span>
        )}
        <div className="h-4 w-px bg-slate-200 mx-1" />
        
        {!hasContent && !isEditing ? (
          <>
            {onManualCreate && (
              <Button size="sm" onClick={onManualCreate} variant="default" className="bg-indigo-600 hover:bg-indigo-700">
                <PenTool className="w-4 h-4 mr-2" /> Create Manually
              </Button>
            )}
            {onAIGenerate && (
              <Button size="sm" onClick={onAIGenerate} variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                <Sparkles className="w-4 h-4 mr-2" /> Generate with AI
              </Button>
            )}
            {onImport && (
              <Button size="sm" onClick={onImport} variant="outline">
                <UploadCloud className="w-4 h-4 mr-2" /> Import
              </Button>
            )}
          </>
        ) : (
          <>
            {isEditing ? (
              <Button size="sm" onClick={onPreview} variant="outline" className="text-muted-foreground hover:text-foreground bg-secondary hover:bg-accent">
                <span className="font-bold mr-2 text-lg leading-none">&times;</span> Cancel / View
              </Button>
            ) : (
              <Button size="sm" onClick={onEdit} variant="outline">
                <PenTool className="w-4 h-4 mr-2" /> Edit
              </Button>
            )}
            
            {onViewHistory && (
              <Button size="sm" onClick={onViewHistory} variant="ghost" className="text-muted-foreground">
                <History className="w-4 h-4 mr-2" /> History
              </Button>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isEditing && (
          <>
            {onSaveDraft && (
              <Button size="sm" onClick={onSaveDraft} variant="outline" disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
            )}
            {onPublish && (
              <Button size="sm" onClick={onPublish} className="bg-green-600 hover:bg-green-700 text-white" disabled={isSaving || isValidating}>
                <Send className="w-4 h-4 mr-2" /> {isValidating ? 'Validating...' : 'Publish'}
              </Button>
            )}
          </>
        )}
        {(hasContent || isEditing) && (
            
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-foreground h-8 w-8 ml-1">
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onImport && (
                  <DropdownMenuItem onClick={onImport}>
                    <UploadCloud className="w-4 h-4 mr-2" /> Import Additional
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="w-4 h-4 mr-2" /> Duplicate
                  </DropdownMenuItem>
                )}
                {onArchive && status !== 'archived' && (
                  <DropdownMenuItem onClick={onArchive}>
                    <Archive className="w-4 h-4 mr-2" /> Archive
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
