import { AIGenerationService } from '../ai/generation.service';
import { TNPSC_GROUP_IV_SYLLABUS, VALIDATION_RULES } from './syllabus-data';

export type ValidationStatus = 'IN SYLLABUS' | 'PARTIALLY RELEVANT' | 'OUT OF SYLLABUS';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface ValidationFlag {
  sectionId?: string;
  sectionTitle: string;
  status: ValidationStatus;
  reason: string;
  recommendation: string; // e.g., "Remove section", "Replace with TNPSC-level questions"
}

export interface ValidationReport {
  overallCoverageScore: number;
  isPublishable: boolean;
  totalSections: number;
  matchingSections: number;
  reviewSections: number;
  outOfSyllabusSections: number;
  flags: ValidationFlag[];
  difficulty: DifficultyLevel;
  standardCompliance: string;
}

export class SyllabusValidator {
  public static async validateContent(
    subjectId: string,
    topicName: string,
    content: any,
    contentType: 'study' | 'examples' | 'practice'
  ): Promise<ValidationReport> {
    const prompt = `
You are a Senior Curriculum Architect and TNPSC Subject Matter Expert.
Your task is to validate the following ${contentType} content against the official TNPSC Group IV syllabus.

Official Syllabus Data:
${JSON.stringify(TNPSC_GROUP_IV_SYLLABUS, null, 2)}

Validation Rules:
- The content MUST be strictly ${VALIDATION_RULES.standard}.
- Disallowed Complexity: ${VALIDATION_RULES.disallowed_complexity.join(', ')}.
- Difficulties Allowed: ${VALIDATION_RULES.allowed_difficulties.join(', ')}.
- Out of Syllabus content must be flagged strictly.

Content to Validate (Topic: ${topicName}):
${JSON.stringify(content, null, 2)}

INSTRUCTIONS:
1. Analyze each section/question in the content.
2. Classify each as 'IN SYLLABUS', 'PARTIALLY RELEVANT', or 'OUT OF SYLLABUS'.
3. Generate a Validation Report in JSON format exactly matching this structure:
{
  "overallCoverageScore": 95, // 0-100
  "isPublishable": true, // false if ANY section is OUT OF SYLLABUS
  "totalSections": 10,
  "matchingSections": 9,
  "reviewSections": 1,
  "outOfSyllabusSections": 0,
  "flags": [
    {
      "sectionTitle": "Title of section or question snippet",
      "status": "PARTIALLY RELEVANT",
      "reason": "Brief reason",
      "recommendation": "Remove section or rewrite"
    }
  ],
  "difficulty": "Medium",
  "standardCompliance": "Matches SSLC standard"
}

Respond ONLY with the JSON. Do not include markdown code blocks (\`\`\`json).
`;

    // We pass a dummy context for the generation service since it requires one
    const context = {
      subject: subjectId,
      topic: topicName,
      currentTab: contentType,
      learningGoals: [],
      userDifficulty: 'Medium'
    };

    const response = await AIGenerationService.generateContent({
      prompt,
      context
    });

    if (!response.success || !response.content) {
      throw new Error(response.error || 'Failed to validate content.');
    }

    try {
      const report: ValidationReport = JSON.parse(response.content);
      return report;
    } catch (e) {
      console.error('Failed to parse validation report:', response.content);
      throw new Error('Invalid validation report format received from AI.');
    }
  }
}
