import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildPracticeGeneratePrompt } from '@/lib/ai/prompts/practice';
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
    console.log('[PRACTICE GENERATE] Generated Prompt Length:', prompt.length);

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      console.error('[PRACTICE GENERATE] Missing OPENROUTER_API_KEY');
      return NextResponse.json({ error: 'Configuration Error: Missing OpenRouter API Key.' }, { status: 500 });
    }

    console.log('[PRACTICE GENERATE] Calling OpenRouter API...');
    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.text();
      console.error('[PRACTICE GENERATE] OpenRouter API Error:', aiResponse.status, errorData);
      return NextResponse.json({ error: `OpenRouter API Error: Status ${aiResponse.status}` }, { status: aiResponse.status });
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('[PRACTICE GENERATE] Empty response from OpenRouter API:', aiData);
      return NextResponse.json({ error: 'Invalid Response Format: Received empty content from AI.' }, { status: 500 });
    }
    
    console.log('[PRACTICE GENERATE] AI Response received successfully. Raw length:', content.length);

    // Clean up markdown wrapping if present
    if (content.startsWith('```json')) {
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (content.startsWith('```')) {
      content = content.replace(/```/g, '').trim();
    }

    let generatedQuestions;
    try {
      generatedQuestions = JSON.parse(content);
    } catch (parseError) {
      console.error('[PRACTICE GENERATE] JSON Parse Error:', parseError);
      console.error('[PRACTICE GENERATE] Raw AI Content that failed to parse:', content);
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
