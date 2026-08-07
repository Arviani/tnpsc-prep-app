import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { texts, targetLanguage } = await request.json();

    if (!texts || !Array.isArray(texts)) {
      return NextResponse.json({ error: 'texts array is required' }, { status: 400 });
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    const prompt = `Translate the following JSON array of strings into ${targetLanguage}. Maintain the exact same array structure and length. Return ONLY a valid JSON array of strings, with no markdown formatting or backticks.\n\nInput:\n${JSON.stringify(texts)}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openrouterKey}`
      },
      body: JSON.stringify({
        model: 'google/gemma-2-9b-it:free',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Strip markdown formatting if the model still includes it
    if (content.startsWith('```json')) {
      content = content.substring(7);
    } else if (content.startsWith('```')) {
      content = content.substring(3);
    }
    if (content.endsWith('```')) {
      content = content.substring(0, content.length - 3);
    }
    
    content = content.trim();

    const translatedTexts = JSON.parse(content);
    
    if (!Array.isArray(translatedTexts) || translatedTexts.length !== texts.length) {
      throw new Error('Translation API returned invalid structure');
    }

    return NextResponse.json({ translatedTexts });
  } catch (error: any) {
    console.error('Translation failed:', error);
    return NextResponse.json({ error: error.message || 'Translation failed' }, { status: 500 });
  }
}
