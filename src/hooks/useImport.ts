import { useState, useCallback } from 'react'
import { useUpload } from './useUpload'
import { useParser } from './useParser'
import { validationService, ValidationError } from '@/services/validation/validation.service'
import { importQuestionsAction, ImportSummaryResult } from '@/actions/import.action'
import { ParsedQuestion } from '@/services/parser/schemas'

export type ImportState = 'upload' | 'uploading_file' | 'processing_ai' | 'review' | 'importing' | 'summary'

export function useImport() {
  const [currentState, setCurrentState] = useState<ImportState>('upload')
  const [extractionMode, setExtractionMode] = useState<'automatic' | 'ai'>('automatic')
  const [file, setFile] = useState<File | null>(null)

  const uploader = useUpload()
  const parser = useParser()

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [importResult, setImportResult] = useState<ImportSummaryResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const validateCurrentQuestions = useCallback((qs: ParsedQuestion[]) => {
    const errors = validationService.validateParsedQuestions(qs)
    setValidationErrors(errors)
    return errors
  }, [])

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile)

    // 1. Upload File to Supabase Storage
    setCurrentState('uploading_file')
    const path = await uploader.uploadFile(uploadedFile)
    
    if (!path) {
      setCurrentState('upload')
      return
    }

    // 2. Process via selected extraction mode
    setCurrentState('processing_ai')
    const questions = await parser.parseDocument(path, extractionMode)
    
    if (!questions || questions.length === 0) {
      setImportError('No questions were extracted.')
      setCurrentState('upload')
      return
    }

    validateCurrentQuestions(questions)
    setCurrentState('review')
  }

  const startImport = async (validOnly: boolean = false) => {
    let qs = parser.parsedQuestions
    if (qs.length === 0) return

    // Validate
    const errors = validateCurrentQuestions(qs)
    
    if (validOnly) {
      const errorIndices = new Set(errors.map(e => e.questionIndex))
      qs = qs.filter((_, idx) => !errorIndices.has(idx))
      if (qs.length === 0) {
        setImportError('No valid questions left to import.')
        return
      }
    } else if (errors.length > 0) {
      setImportError('Please fix all validation errors before importing.')
      return 
    }

    setIsImporting(true)
    setCurrentState('importing')
    setImportError(null)

    try {
      const result = await importQuestionsAction(qs, parser.paperMetadata)
      setImportResult(result)
      setCurrentState('summary')
    } catch (e: any) {
      setImportError(e.message || 'Failed to save to database')
      setCurrentState('review')
    } finally {
      setIsImporting(false)
    }
  }

  const handleUpdateQuestions = useCallback((qs: ParsedQuestion[]) => {
    parser.setParsedQuestions(qs)
    validateCurrentQuestions(qs)
  }, [parser, validateCurrentQuestions])

  const reset = useCallback(() => {
    setCurrentState('upload')
    setFile(null)
    parser.setParsedQuestions([])
    setValidationErrors([])
    setImportResult(null)
    setImportError(null)
  }, [parser])

  return {
    currentState,
    file,
    extractionMode,
    setExtractionMode,
    handleFileUpload,
    startImport,
    startImportValidOnly: () => startImport(true),
    reset,
    
    uploader,
    parser,
    
    validationErrors,
    validateCurrentQuestions,
    handleUpdateQuestions,
    
    isImporting,
    importResult,
    importError
  }
}
