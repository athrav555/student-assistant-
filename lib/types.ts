/**
 * Shared types for the PDF -> Study Materials pipeline.
 * Both the API route and the frontend components import from here,
 * so the "shape" of AI-generated content only has to be defined once.
 */

export interface Flashcard {
  front: string; // question or concept prompt
  back: string; // answer or explanation
}

export interface QuizQuestion {
  question: string;
  options: string[]; // always exactly 4 strings
  correctAnswer: string; // must exactly match one entry in `options`
}

export interface StudyMaterial {
  /**
   * Study notes as an array of Markdown "sections" (e.g. one string per
   * heading + its content). Keeping them as an array — rather than one
   * giant blob — makes it easy to render each section as its own block.
   */
  notes: string[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export interface GenerateMeta {
  fileName: string;
  pageCount: number;
  extractedChars: number;
  truncated: boolean;
}

export interface GenerateSuccess {
  success: true;
  data: StudyMaterial;
  meta: GenerateMeta;
}

export interface GenerateFailure {
  success: false;
  error: string;
}

export type GenerateResponse = GenerateSuccess | GenerateFailure;
