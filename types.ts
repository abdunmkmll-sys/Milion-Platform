
export type Language = 'ar' | 'en';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 'science' | 'history' | 'geography' | 'math' | 'general' | 'religion';

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
  language: Language;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface QuizSession {
  questions: Question[];
  currentIndex: number;
  score: number;
  answers: { questionId: string; selectedIndex: number; isCorrect: boolean; timeTaken: number }[];
  isFinished: boolean;
  startTime: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  accuracy: number;
  time: number;
  date: string;
}

export interface CommunityComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  reactions: { type: string; count: number }[];
}

export interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}
