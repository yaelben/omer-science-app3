export interface Lesson {
  id: string;
  title: string;
  shortSummary: string;
  explanation: string[];
  remember: string[];
  didYouKnow: string;
  quickCheckIds: string[];
}

export type QuestionType = 'multiple_choice' | 'multiple_select' | 'true_false' | 'matching' | 'ordering';

export interface Question {
  id: string;
  type: QuestionType;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  answer: string | string[] | boolean | string[];
  explanation: string;
  pairs?: { left: string; right: string }[];
  items?: string[];
}

export interface UserProgress {
  completedLessons: string[];
  lastExamScore: number | null;
  bestExamScore: number | null;
}
