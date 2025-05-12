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
