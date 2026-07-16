'use client'

import React from 'react'
import { useImport } from '@/hooks/useImport'
import { ModeSelection } from '@/components/admin/import/ModeSelection'
import { UploadArea } from '@/components/admin/import/UploadArea'
import { ProcessingView } from '@/components/admin/import/ProcessingView'
import { ReviewWorkspace } from '@/components/admin/import/ReviewWorkspace'
import { ImportSummary } from '@/components/admin/import/ImportSummary'

export default function ImportPage() {
  const {
    currentState,
    file,
    handleFileUpload,
    startImport,
    startImportValidOnly,
    reset,
    parser,
    uploader,
    validationErrors,
    isImporting,
    importResult,
    importError,
    extractionMode,
    setExtractionMode,
    handleUpdateQuestions
  } = useImport()

  return (
    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto">
      {currentState === 'upload' && (
        <div className="max-w-3xl mx-auto mt-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">Import Question Paper</h1>
            <p className="text-[13px] text-muted-foreground">Extract TNPSC questions from documents automatically or using Gemini Vision AI.</p>
          </div>
          
          <ModeSelection selectedMode={extractionMode} onSelect={setExtractionMode} />
          
          {uploader.error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md font-medium text-sm border border-destructive/20">
              Error: {uploader.error}
            </div>
          )}
          {importError && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md font-medium text-sm border border-destructive/20">
              Import Error: {importError}
            </div>
          )}

          <UploadArea onUpload={handleFileUpload} isUploading={uploader.isUploading} />
        </div>
      )}

      {(currentState === 'uploading_file' || currentState === 'processing_ai') && (
        <div className="max-w-2xl mx-auto mt-20">
          <ProcessingView state={currentState} filename={file?.name} />
        </div>
      )}

      {currentState === 'review' && (
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold mb-1">Review Workspace</h1>
              <p className="text-muted-foreground text-[13px]">Review, edit, and validate extracted questions before importing into Supabase.</p>
            </div>
            <button
              onClick={reset}
              className="text-[13px] font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel Import
            </button>
          </div>

          <ReviewWorkspace 
            questions={parser.parsedQuestions}
            setQuestions={handleUpdateQuestions}
            paperMetadata={parser.paperMetadata}
            setPaperMetadata={parser.setPaperMetadata}
            validationErrors={validationErrors}
            onImport={startImport}
            onImportValidOnly={startImportValidOnly}
            isImporting={isImporting}
            importError={importError}
          />
        </div>
      )}

      {currentState === 'summary' && importResult && (
        <div className="max-w-3xl mx-auto">
          <ImportSummary result={importResult} onNewImport={reset} />
        </div>
      )}
    </div>
  )
}
