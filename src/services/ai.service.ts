export interface GeneratedTopic {
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimated_minutes: number;
}

export const aiService = {
  async generateSubjectTopics(subjectName: string): Promise<GeneratedTopic[]> {
    try {
      console.log(`[aiService] Starting generation for subject: ${subjectName}`);
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate a complete TNPSC syllabus for the subject: "${subjectName}". 
Return ONLY a valid JSON array of objects. Do not include any markdown formatting (like \`\`\`json) or extra text.
Each object must exactly match this schema:
{
  "title": "String (e.g. 'Coding & Decoding')",
  "description": "String (brief description)",
  "difficulty": "String (strictly one of: 'Easy', 'Medium', 'Hard')",
  "estimated_minutes": Number (e.g. 45)
}`,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[aiService] API Error:', response.status, errText);
        throw new Error(`API returned ${response.status}: ${errText}`);
      }

      const data = await response.json();
      console.log('[aiService] Received AI response payload:', data);
      
      // The API route returns { answer: string }
      let jsonString = data.answer;
      
      if (!jsonString) {
        console.error('[aiService] Missing "answer" in AI response payload:', data);
        throw new Error('Missing "answer" in AI response payload');
      }

      // Strip markdown code blocks if present
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonString.trim());
      } catch (parseError: any) {
        console.error('[aiService] Failed to parse JSON:', jsonString);
        throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
      }
      
      if (!Array.isArray(parsed)) {
        console.error('[aiService] Response is not an array:', parsed);
        throw new Error('AI response must be a JSON array');
      }

      // Validate required fields and remove duplicates based on title
      const uniqueTopics = new Map<string, GeneratedTopic>();
      
      for (const [index, item] of parsed.entries()) {
        if (!item.title || typeof item.title !== 'string') {
          throw new Error(`Item at index ${index} missing required string field 'title'`);
        }
        if (!item.description || typeof item.description !== 'string') {
          throw new Error(`Item at index ${index} missing required string field 'description'`);
        }
        if (!['Easy', 'Medium', 'Hard'].includes(item.difficulty)) {
          throw new Error(`Item at index ${index} has invalid difficulty: ${item.difficulty}`);
        }
        if (typeof item.estimated_minutes !== 'number') {
          throw new Error(`Item at index ${index} missing required number field 'estimated_minutes'`);
        }
        
        // Use normalized title as key to prevent duplicates
        const key = item.title.toLowerCase().trim();
        if (!uniqueTopics.has(key)) {
          uniqueTopics.set(key, item as GeneratedTopic);
        }
      }
      
      const validatedTopics = Array.from(uniqueTopics.values());
      console.log(`[aiService] Successfully generated ${validatedTopics.length} unique topics.`);
      return validatedTopics;
    } catch (error: any) {
      console.error('[aiService] Error generating topics:', error);
      throw error;
    }
  }
};
