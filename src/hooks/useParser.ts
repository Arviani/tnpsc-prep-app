import { useState } from 'react'
import { parseDocumentAction } from '@/actions/parse.action'
import { ParsedQuestion } from '@/services/parser/schemas'

export function useParser() {
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([])
  const [paperMetadata, setPaperMetadata] = useState<any>(null)

  const parseDocument = async (storagePath: string, mode: 'automatic' | 'ai' = 'ai') => {
    setIsParsing(true)
    setError(null)
    try {
      const result = await parseDocumentAction(storagePath, mode)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Parsing failed on server.')
      }

      setParsedQuestions(result.data.questions || [])
      if (result.data.paperMetadata) {
         setPaperMetadata(result.data.paperMetadata)
      }
      return result.data.questions
    } catch (e: any) {
      setError(e.message || 'AI Parsing failed')
      return null
    } finally {
      setIsParsing(false)
    }
  }

  return { 
    parserError: error,
    parseDocument,
    isParsing,
    parsedQuestions,
    setParsedQuestions,
    paperMetadata,
    setPaperMetadata
  }
}
