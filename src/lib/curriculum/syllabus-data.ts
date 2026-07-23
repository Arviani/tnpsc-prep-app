export interface Subtopic {
  name: string;
  allowedFormulas?: string[];
  disallowedFormulas?: string[];
  description?: string;
}

export interface SyllabusTopic {
  id: string;
  name: string;
  subtopics: Subtopic[];
}

export const TNPSC_GROUP_IV_SYLLABUS: SyllabusTopic[] = [
  {
    id: "general-science",
    name: "General Science",
    subtopics: []
  },
  {
    id: "current-affairs",
    name: "Current Affairs",
    subtopics: []
  },
  {
    id: "geography",
    name: "Geography",
    subtopics: []
  },
  {
    id: "history-culture-india",
    name: "History and Culture of India",
    subtopics: []
  },
  {
    id: "indian-polity",
    name: "Indian Polity",
    subtopics: []
  },
  {
    id: "indian-economy",
    name: "Indian Economy",
    subtopics: []
  },
  {
    id: "indian-national-movement",
    name: "Indian National Movement",
    subtopics: []
  },
  {
    id: "history-culture-tn",
    name: "History, Culture, Heritage and Socio Political Movements of Tamil Nadu",
    subtopics: []
  },
  {
    id: "development-admin-tn",
    name: "Development Administration in Tamil Nadu",
    subtopics: []
  },
  {
    id: "aptitude",
    name: "Aptitude & Mental Ability",
    subtopics: [
      { name: "Simplification" },
      { name: "Percentage" },
      { name: "HCF" },
      { name: "LCM" },
      { name: "Ratio & Proportion" },
      { name: "Simple Interest" },
      { name: "Compound Interest" },
      { name: "Area" },
      { name: "Volume" },
      { name: "Time and Work" },
      { name: "Logical Reasoning" },
      { name: "Puzzles" },
      { name: "Dice" },
      { name: "Visual Reasoning" },
      { name: "Alpha Numeric Reasoning" },
      { 
        name: "Number Series",
        allowedFormulas: [
          "Arithmetic",
          "Geometric",
          "Squares",
          "Cubes",
          "Prime Numbers",
          "Fibonacci",
          "Alternating",
          "Hybrid"
        ],
        disallowedFormulas: [
          "Tetrahedral Numbers",
          "Advanced Number Theory",
          "Complex Mathematical Derivations"
        ]
      }
    ]
  }
];

export const VALIDATION_RULES = {
  standard: "SSLC Standard",
  disallowed_complexity: [
    "graduate-level mathematics",
    "banking-only reasoning patterns",
    "CAT-level aptitude",
    "SSC advanced reasoning"
  ],
  allowed_difficulties: ["Easy", "Medium", "Hard"]
};
