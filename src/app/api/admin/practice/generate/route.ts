import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildPracticeGeneratePrompt } from '@/lib/ai/prompts/practice';
import { AIGenerationService } from '@/lib/ai/generation.service';
import { TopicContext } from '@/lib/ai/context';

export async function POST(request: Request) {
  try {
    const { subjectId, topicId, subjectName, topicTitle } = await request.json();
    console.log(`[PRACTICE GENERATE] Request received for Subject: ${subjectName} (${subjectId}), Topic: ${topicTitle} (${topicId})`);

    if (!subjectId || !topicId || !subjectName || !topicTitle) {
      console.error('[PRACTICE GENERATE] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: subjectId, topicId, subjectName, topicTitle are required.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Auth Check
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('[PRACTICE GENERATE] Unauthorized access attempt');
      return NextResponse.json({ error: 'Authentication Error: Please log in to generate content.' }, { status: 401 });
    }

    const context: TopicContext = {
      subject: subjectName,
      topic: topicTitle,
      currentTab: 'practice',
      exam: 'TNPSC Group 4',
      language: 'English',
      difficulty: 'Medium',
      userRole: 'admin'
    };
    
    const prompt = buildPracticeGeneratePrompt(context);
    
    const aiResponse = await AIGenerationService.generateContent({
      prompt,
      context,
      requestId: crypto.randomUUID()
    });

    if (!aiResponse.success || !aiResponse.content) {
      return NextResponse.json(
        { error: aiResponse.error || 'Failed to generate content' }, 
        { status: aiResponse.status || 500 }
      );
    }

    let generatedQuestions;
    try {
      generatedQuestions = JSON.parse(aiResponse.content);
    } catch (parseError) {
      console.error('[PRACTICE GENERATE] JSON Parse Error:', parseError);
      console.error('[PRACTICE GENERATE] Raw AI Content that failed to parse:', aiResponse.content);
      return NextResponse.json({ error: 'Invalid Response Format: AI did not return a valid JSON object.' }, { status: 500 });
    }

    if (!Array.isArray(generatedQuestions)) {
      console.error('[PRACTICE GENERATE] AI returned non-array JSON:', generatedQuestions);
      return NextResponse.json({ error: 'Invalid Response Format: AI returned JSON but it was not an array of questions.' }, { status: 500 });
    }

    console.log(`[PRACTICE GENERATE] Successfully parsed ${generatedQuestions.length} questions.`);

    // Instead of saving, just return the generated questions for preview
    return NextResponse.json({ success: true, questions: generatedQuestions });
  } catch (error: any) {
    console.error('[PRACTICE GENERATE] Unhandled Exception:', error.stack || error);
    return NextResponse.json(
      { error: 'Internal Server Error: ' + (error.message || 'Failed to generate practice questions') },
      { status: 500 }
    );
  }
}
