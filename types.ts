
export type Grade = 11 | 12;

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number; // Index của options (0, 1, 2, 3)
  explanation?: string;
}

export interface Lesson {
  id: string;
  title: string;
  topic: string;
  summary: string;
  keyPoints: string[];
  grade: Grade;
  questions?: Question[];
}

export interface Curriculum {
  [key: number]: Lesson[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
