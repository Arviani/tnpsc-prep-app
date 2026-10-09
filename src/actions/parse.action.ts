'use server'

import { createClient } from '@/lib/supabase/server'
import { geminiQuestionParser } from '@/services/parser/geminiQuestionParser.service'
import { structuredQuestionParser } from '@/services/parser/structuredQuestionParser.service'
import { ParserResponse } from '@/services/parser/schemas'

export type ExtractionMode = 'automatic' | 'ai'

export async function parseDocumentAction(
  storagePath: string, 
  mode: ExtractionMode = 'ai'
): Promise<{ success: boolean; data?: ParserResponse; error?: string }> {
  try {
    const supabase = await createClient()

    // 1. Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('question-papers')
      .download(storagePath)

    if (downloadError || !fileData) {
      console.error('Download Error:', downloadError)
      return { success: false, error: 'Failed to download file from storage.' }
    }

    // 2. Convert to Buffer
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log(`Downloaded file from Supabase. Size: ${buffer.length} bytes`)

    // 3. Parse based on mode
    let result: ParserResponse;
    const isPDF = storagePath.toLowerCase().endsWith('.pdf')
    const isDocx = storagePath.toLowerCase().endsWith('.docx') || storagePath.toLowerCase().endsWith('.doc')
    
    let text = ''
    
    if (!isPDF) {
      if (isDocx) {
        try {
           const mammoth = require('mammoth')
           // If it's a real docx, this will extract text
           const extracted = await mammoth.extractRawText({ buffer })
           text = extracted.value
           
           // If mammoth fails or returns nothing, it might be our custom HTML .doc
           if (!text || text.trim() === '') {
             text = buffer.toString('utf-8')
           }
        } catch (e) {
           // Fallback if mammoth fails (e.g. for HTML-based .doc)
           text = buffer.toString('utf-8')
        }
      } else {
        text = buffer.toString('utf-8')
      }
    }

    if (mode === 'automatic') {
      // Automatic Mode: ZERO AI calls.
      if (isPDF) {
        return { success: false, error: 'Automatic extraction is currently only supported for structured text files (.txt) and Word Documents. Please select AI Extract for PDFs.' }
      }
      result = await structuredQuestionParser.parseText(text)
    } else {
      // AI Mode: Use Gemini
      if (isPDF) {
         result = await geminiQuestionParser.parseFile(buffer, 'application/pdf')
      } else {
         result = await geminiQuestionParser.parseText(text)
      }
    }

    return { success: true, data: result }
  } catch (error: any) {
    console.error('Parse Action Error:', error)
    return { success: false, error: error.message || 'An error occurred during parsing.' }
  }
}
