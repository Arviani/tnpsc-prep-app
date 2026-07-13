'use server'

import { createClient } from '@/lib/supabase/server'
import { ParsedQuestion } from '@/services/parser/schemas'

export interface ImportSummaryResult {
  success: boolean
  imported: number
  failed: number
  skipped: number
  error?: string
}

export async function importQuestionsAction(
  questions: ParsedQuestion[], 
  paperMetadata?: any
): Promise<ImportSummaryResult> {
  try {
    const supabase = await createClient()
    let imported = 0
    let failed = 0
    let paperId = null

    // 1. Validate and Insert Paper Metadata if provided
    if (paperMetadata && paperMetadata.exam && paperMetadata.year) {
      // Check for duplicate paper
      const { data: existingPaper } = await supabase
        .from('pyq_papers')
        .select('id')
        .eq('exam', paperMetadata.exam)
        .eq('year', paperMetadata.year)
        .eq('section', paperMetadata.section || '')
        .maybeSingle()

      if (existingPaper) {
        return { 
          success: false, 
          imported: 0, failed: 0, skipped: 0, 
          error: `A paper for ${paperMetadata.exam} (${paperMetadata.year}) already exists in the database. Please change the year, section or exam name.`
        }
      }

      // Insert new paper
      const { data: newPaper, error: paperError } = await supabase
        .from('pyq_papers')
        .insert({
          title: `${paperMetadata.exam} ${paperMetadata.year} ${paperMetadata.section || ''}`.trim(),
          exam: paperMetadata.exam,
          year: paperMetadata.year,
          section: paperMetadata.section || null,
          language: paperMetadata.language || null,
          total_questions: paperMetadata.totalQuestions || questions.length,
          total_marks: paperMetadata.totalMarks || (questions.length * 1.5), // TNPSC default
          status: 'Published'
        })
        .select('id')
        .single()

      if (paperError) throw paperError
      paperId = newPaper.id
    }

    // 2. Insert Questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      try {
        // Insert Question
        const { data: questionData, error: qError } = await (supabase as any)
          .from('questions')
          .insert({
            body: q.question,
            exam_type: q.exam || paperMetadata?.exam || null,
            year: q.year || paperMetadata?.year || null,
            language: q.language || paperMetadata?.language || null,
            marks: q.marks ? Math.round(q.marks) : 1.5,
            is_pyq: true,
          })
          .select('id')
          .single()

        if (qError) throw qError

        // Insert Options
        if (q.options && q.options.length > 0) {
          const optionsToInsert = q.options.map((opt) => ({
            question_id: questionData.id,
            label: opt.label,
            body: opt.body,
            is_correct: opt.label === q.correctAnswer
          }))

          const { error: optError } = await (supabase as any)
            .from('options')
            .insert(optionsToInsert)

          if (optError) throw optError
        }

        // Insert Explanation if exists
        if (q.explanation) {
          const { error: expError } = await (supabase as any)
            .from('explanations')
            .insert({
              question_id: questionData.id,
              body: q.explanation
            })

          if (expError) throw expError
        }

        // 3. Map to Paper if paper exists
        if (paperId) {
          const { error: mapError } = await (supabase as any)
            .from('pyq_paper_questions')
            .insert({
              paper_id: paperId,
              question_id: questionData.id,
              question_number: q.questionNumber || (i + 1),
              display_order: i + 1,
              marks: q.marks || 1.5
            })
            
          if (mapError) throw mapError
        }

        imported++
      } catch (err) {
        console.error('Failed to import question:', err)
        failed++
      }
    }

    return {
      success: failed === 0,
      imported,
      failed,
      skipped: 0
    }

  } catch (error: any) {
    console.error('Import Action Error:', error)
    return { success: false, imported: 0, failed: 0, skipped: 0, error: error.message || 'An error occurred during import.' }
  }
}
