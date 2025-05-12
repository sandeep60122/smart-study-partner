// src/lib/types.ts

export interface Flashcard {
  question: string;
  answer: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}
