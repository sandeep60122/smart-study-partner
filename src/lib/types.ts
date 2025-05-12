// src/lib/types.ts

export interface Flashcard {
  question: string;
  answer: string;
}

export interface Task {
  id: string;
  name: string; // Replaces 'text'
  description?: string; // Optional
  requiredTime?: number; // In hours, optional
  deadline?: string; // ISO date string (YYYY-MM-DD), optional
  priority?: 'Low' | 'Medium' | 'High'; // Optional
  completed: boolean;
}


// Types for the Quiz feature
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizResult {
  id: string; // Unique ID for the result entry
  quizTitle: string;
  summaryHash?: string; // Optional: Hash of the summary used to generate the quiz
  score: number; // Number of correct answers
  totalQuestions: number;
  percentage: number; // Score as a percentage
  userAnswers: (string | null)[]; // Store the user's selected answer for each question
  timestamp: number; // When the quiz was completed (Date.now())
}
