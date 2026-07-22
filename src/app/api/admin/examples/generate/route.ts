import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildExamplesPrompt } from '@/lib/ai/prompts/examples';
import { AIGenerationService } from '@/lib/ai/generation.service';
import { TopicContext } from '@/lib/ai/context';

export async function POST(request: Request) {
  try {
    const { subjectId, topicId, subjectName, topicTitle } = await request.json();
    console.log(`[EXAMPLES GENERATE] Request received for Subject: ${subjectName} (${subjectId}), Topic: ${topicTitle} (${topicId})`);

    if (!subjectId || !topicId || !subjectName || !topicTitle) {
      console.error('[EXAMPLES GENERATE] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: subjectId, topicId, subjectName, topicTitle are required.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Auth Check
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('[EXAMPLES GENERATE] Unauthorized access attempt');
      return NextResponse.json({ error: 'Authentication Error: Please log in to generate content.' }, { status: 401 });
    }

    const context: TopicContext = {
      subject: subjectName,
      topic: topicTitle,
      currentTab: 'examples',
      exam: 'TNPSC Group 4',
      language: 'English',
      difficulty: 'Medium',
      userRole: 'admin'
    };

    const prompt = buildExamplesPrompt(context);
    
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

    let generatedExamples;
    try {
      generatedExamples = JSON.parse(aiResponse.content);
    } catch (parseError) {
      console.error('[EXAMPLES GENERATE] JSON Parse Error:', parseError);
      console.error('[EXAMPLES GENERATE] Raw AI Content that failed to parse:', aiResponse.content);
      return NextResponse.json({ error: 'Invalid Response Format: AI did not return a valid JSON object.' }, { status: 500 });
    }

    if (!Array.isArray(generatedExamples)) {
      console.error('[EXAMPLES GENERATE] AI returned non-array JSON:', generatedExamples);
      return NextResponse.json({ error: 'Invalid Response Format: AI returned JSON but it was not an array of examples.' }, { status: 500 });
    }

    console.log(`[EXAMPLES GENERATE] Successfully parsed ${generatedExamples.length} examples.`);

    return NextResponse.json({ success: true, examples: generatedExamples });
  } catch (error: any) {
    console.error('[EXAMPLES GENERATE] Unhandled Exception:', error.stack || error);
    return NextResponse.json(
      { error: 'Internal Server Error: ' + (error.message || 'Failed to generate examples') },
      { status: 500 }
    );
  }
}
