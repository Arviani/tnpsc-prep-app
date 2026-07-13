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
    
    if (mode === 'automatic') {
      // Automatic Mode: ZERO AI calls.
      // We assume the file is a text file, or we convert the buffer to text if it's utf-8.
      if (isPDF) {
        return { success: false, error: 'Automatic extraction is currently only supported for structured text files (.txt). Please select AI Extract for PDFs.' }
      }
      const text = buffer.toString('utf-8')
      result = await structuredQuestionParser.parseText(text)
    } else {
      // AI Mode: Use Gemini
      if (isPDF) {
         result = await geminiQuestionParser.parseFile(buffer, 'application/pdf')
      } else {
         const text = buffer.toString('utf-8')
         result = await geminiQuestionParser.parseText(text)
      }
    }

    return { success: true, data: result }
  } catch (error: any) {
    console.error('Parse Action Error:', error)
    return { success: false, error: error.message || 'An error occurred during parsing.' }
  }
}
