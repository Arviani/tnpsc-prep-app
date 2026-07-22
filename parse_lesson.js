const fs = require('fs');
const { generateText } = require('ai');
const { createOpenAI } = require('@ai-sdk/openai');
require('dotenv').config({ path: '.env.local' });

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function main() {
  const content = fs.readFileSync('../Source/reasoning-numeric-study.txt', 'utf8');
  const prompt = `You are a Senior Curriculum Architect, UX Writer and Content Structuring Expert.
Your task is NOT to rewrite the lesson.
Your task is to convert the provided TNPSC lesson into a structured format suitable for a modern learning platform.
Do NOT summarize. Do NOT remove content. Do NOT shorten explanations. Only reorganize and structure.
Return ONLY valid JSON. No markdown. No explanations.
ROOT STRUCTURE: { "subject": "Reasoning", "topic": "Number Series", "reading_time": "18 min", "difficulty": "Beginner to Advanced", "estimated_marks": "3-6 Questions", "sections":[] }
SECTIONS: Break the lesson into logical sections. Each section should contain { "id":"...", "title":"...", "icon":"book-open", "order":1, "content":"<html>", "children":[] }
CONTENT: Convert paragraphs into HTML. Use <h2>, <h3>, <p>, <ul>, <ol>, <table>, <thead>, <tbody>, <tr>, <td>, <strong>, <blockquote>. Avoid markdown. Do not use #, **, ---.
SECTION ORDER: 1 Overview, 2 Learning Objectives, 3 Prerequisites, 4 Introduction, 5 Types of Number Series, 6 Pattern Recognition, 7 Solving Strategy, 8 Shortcut Techniques, 9 Memory Tricks, 10 Worked Examples (move to examples array), 11 Practice Questions (move to practice array), 12 TNPSC Style Questions (move to practice array), 13 Common Mistakes, 14 Exam Strategy, 15 Formula Sheet, 16 Revision Notes, 17 Flashcards (move to flashcards array), 18 FAQs (move to faqs array), 19 Quick Revision Table, 20 Key Takeaways.
WORKED EXAMPLES: Instead of one HTML blob, create "examples":[{ "title":"", "difficulty":"", "question":"", "thinking":"", "solution":"", "shortcut":"", "exam_tip":"" }]
PRACTICE QUESTIONS: Create "practice":[{ "question":"", "options":[{ "label":"A", "text":"", "correct":false }], "answer":"B", "explanation":"", "difficulty":"" }]
FLASHCARDS: Create "flashcards":[{ "front":"", "back":"" }]
FAQ: Create "faqs":[{ "question":"", "answer":"" }]
TABLE OF CONTENTS: Generate an index object "tableOfContents":[{ "id":"overview", "title":"Overview", "order":1 }]

LESSON CONTENT:
${content}
`;

  console.log("Starting generation with GPT-4o via OpenRouter...");
  try {
    const { text } = await generateText({
      model: openrouter('openai/gpt-4o'),
      prompt: prompt,
      maxTokens: 8192,
    });
    
    let jsonStr = text;
    if (jsonStr.startsWith('\`\`\`json')) {
      jsonStr = jsonStr.replace(/\`\`\`json\n/, '').replace(/\`\`\`$/, '');
    } else if (jsonStr.startsWith('\`\`\`')) {
      jsonStr = jsonStr.replace(/\`\`\`\n/, '').replace(/\`\`\`$/, '');
    }
    fs.writeFileSync('../Source/structured-reasoning.json', jsonStr.trim());
    console.log('Successfully generated JSON.');
  } catch (err) {
    console.error(err);
  }
}
main();
