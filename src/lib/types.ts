// src/lib/types.ts

export interface Flashcard {
  id: string; // Unique ID for the flashcard
  question: string;
  answer: string;
  // SRS Fields
  interval: number; // Next review interval in days
  repetition: number; // Number of times this card has been successfully recalled in a row
  easeFactor: number; // Multiplier for interval (default 2.5)
  dueDate: number; // Timestamp for next review
  lastReviewedDate?: number; // Timestamp of the last review
  summaryHash?: string; // To associate with a specific summary
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  requiredTime?: number; // In hours
  deadline?: string; // ISO date string (YYYY-MM-DD)
  priority?: 'Low' | 'Medium' | 'High';
  completed: boolean;
  completionDate?: number; // Timestamp when completed
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizResult {
  id: string;
  quizTitle: string;
  summaryHash?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  userAnswers: (string | null)[];
  timestamp: number;
}

// Gamification Types
export interface Badge {
  id: string; // e.g., 'first-task-completed', 'quiz-master'
  name: string;
  description: string;
  icon: string; // Lucide icon name
  achievedDate: number; // Timestamp
}

export interface UserProfileData {
  username: string;
  points: number;
  badges: Badge[];
  // Could add more preferences or stats here later
}

// Calendar/Scheduler Types
export interface StudySession {
  id: string;
  taskId: string; // Link to a task
  taskName: string; // Denormalized for easy display
  startTime: number; // Timestamp for start of session
  endTime: number; // Timestamp for end of session
  notes?: string;
}
