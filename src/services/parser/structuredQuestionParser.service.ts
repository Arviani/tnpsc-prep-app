import { ParserResponse, ParsedQuestion, Option } from './schemas'

export class StructuredQuestionParser {
  
  async parseText(text: string): Promise<ParserResponse> {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    
    let paperMetadata = {
      exam: null as string | null,
      year: null as number | null,
      section: null as string | null,
      language: null as string | null,
      totalQuestions: null as number | null,
      totalMarks: null as number | null,
    }

    // Try to parse basic metadata from the first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i]
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim())
        for (const p of parts) {
          if (p.toLowerCase().includes('tnpsc')) {
            const match = p.match(/(.*?)\s*-\s*(\d{4})/)
            if (match) {
              paperMetadata.exam = match[1].trim()
              paperMetadata.year = parseInt(match[2])
            }
          }
          if (p.includes('பகுதி') || p.toLowerCase().includes('section')) {
            paperMetadata.section = p
          }
          if (p.includes('மொத்த வினாக்கள்') || p.toLowerCase().includes('total questions')) {
            const match = p.match(/\d+/)
            if (match) paperMetadata.totalQuestions = parseInt(match[0])
          }
          if (p.includes('மதிப்பெண்கள்') || p.toLowerCase().includes('marks')) {
             const match = p.match(/\d+/)
             if (match) paperMetadata.totalMarks = parseInt(match[0])
          }
        }
      }
    }

    const questions: ParsedQuestion[] = []
    
    // Improved Regex approach for the question blocks
    // We combine all lines and split by something that looks like a new question.
    // Since questions may not have numbers, we split by looking for the pattern of (A)... (B)... Answer: (X)
    
    // Actually, a safer way is to split the text by "Answer: (X)" to isolate each question block
    const rawBlocks = text.split(/Answer:\s*\([A-E]\)/i)
    
    let qNumber = 1
    
    for (let i = 0; i < rawBlocks.length; i++) {
      let block = rawBlocks[i].trim()
      if (!block) continue
      
      // Determine the answer for this block by looking at the original text separator
      // Since split removes the separator, we can find the separator in the original text.
      // But it's easier to use a regex exec loop to extract block + answer.
    }
    
    // Let's use a regex exec approach
    const questionRegex = /((?:.|\n)*?)\s*\(A\)\s*((?:.|\n)*?)\s*\(B\)\s*((?:.|\n)*?)\s*\(C\)\s*((?:.|\n)*?)\s*\(D\)\s*((?:.|\n)*?)\s*\(E\)\s*((?:.|\n)*?)\s*Answer:\s*\(([A-E])\)/ig
    
    let match;
    while ((match = questionRegex.exec(text)) !== null) {
      const rawQuestionText = match[1].trim()
      
      // Clean up metadata headers from the first question
      let cleanQuestionText = rawQuestionText
      if (qNumber === 1) {
         const lines = cleanQuestionText.split('\n')
         cleanQuestionText = lines.filter(l => !l.includes('|') && !l.includes('மொத்த')).join('\n').trim()
      }

      // Check if question starts with a number
      let extractedNumber = qNumber
      const numMatch = cleanQuestionText.match(/^(\d+)\.\s*/)
      if (numMatch) {
         extractedNumber = parseInt(numMatch[1])
         cleanQuestionText = cleanQuestionText.substring(numMatch[0].length).trim()
      }

      const options: Option[] = [
        { label: 'A', body: match[2].trim() },
        { label: 'B', body: match[3].trim() },
        { label: 'C', body: match[4].trim() },
        { label: 'D', body: match[5].trim() },
        { label: 'E', body: match[6].trim() }
      ]
      
      questions.push({
        questionNumber: extractedNumber,
        question: cleanQuestionText,
        options,
        correctAnswer: match[7].toUpperCase(),
        exam: paperMetadata.exam,
        year: paperMetadata.year,
        section: paperMetadata.section,
        marks: 1.5 // default TNPSC
      })
      
      qNumber++
    }

    return {
      questions,
      paperMetadata
    }
  }
}

export const structuredQuestionParser = new StructuredQuestionParser()
