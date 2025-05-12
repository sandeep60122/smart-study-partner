// src/hooks/use-srs.ts
import type { Flashcard } from '@/lib/types';

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;
const INITIAL_INTERVAL_CORRECT = 1; // 1 day for first correct
const SUBSEQUENT_INITIAL_INTERVAL_CORRECT = 6; // 6 days for subsequent new cards marked correct

// SRS Quality/Grade mapping (0-5 scale from SM-2, simplified here)
// 0: "Again" (Total blackout)
// 1: "Hard" (Incorrect, but remembered after effort) - Treat as incorrect for simplicity
// 2: "Good" (Correct, but with difficulty) - Treat as correct, slight ease penalty
// 3: "Easy" (Correct, effortless) - Treat as correct, potential ease bonus

export interface ReviewOutcome {
  updatedCard: Flashcard;
}

export function calculateSrsReview(card: Flashcard, quality: 0 | 1 | 2 | 3): ReviewOutcome {
  let newInterval: number;
  let newEaseFactor = card.easeFactor;
  let newRepetition = card.repetition;

  if (quality < 2) { // Incorrect (Again or Hard)
    newRepetition = 0; // Reset repetition count
    newInterval = 1; // Review again tomorrow
    newEaseFactor = Math.max(MIN_EASE_FACTOR, card.easeFactor - 0.2); // Decrease ease factor
  } else { // Correct (Good or Easy)
    newRepetition += 1;
    if (newRepetition === 1) {
      newInterval = INITIAL_INTERVAL_CORRECT;
    } else if (newRepetition === 2) {
      newInterval = SUBSEQUENT_INITIAL_INTERVAL_CORRECT;
    } else {
      newInterval = Math.round(card.interval * newEaseFactor);
    }

    // Adjust ease factor based on quality
    if (quality === 3) { // Easy
      newEaseFactor = card.easeFactor + 0.1;
    } else if (quality === 2 && newRepetition > 1) { // Good (but not first time)
      // No change or slight decrease if it was a bit tough
      // newEaseFactor = Math.max(MIN_EASE_FACTOR, card.easeFactor - 0.05);
    }
    newEaseFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor); // Ensure ease factor doesn't go too low
  }
  
  const now = Date.now();
  const oneDayInMillis = 24 * 60 * 60 * 1000;
  const newDueDate = now + newInterval * oneDayInMillis;

  const updatedCard: Flashcard = {
    ...card,
    interval: newInterval,
    repetition: newRepetition,
    easeFactor: newEaseFactor,
    dueDate: newDueDate,
    lastReviewedDate: now,
  };

  return { updatedCard };
}

export function initializeSrsData(flashcardData: Omit<Flashcard, 'id' | 'interval' | 'repetition' | 'easeFactor' | 'dueDate' | 'summaryHash'>, summaryHash?: string): Flashcard {
  const now = Date.now();
  return {
    ...flashcardData,
    id: crypto.randomUUID(), // Generate a unique ID
    interval: 0, // Will be set on first review
    repetition: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    dueDate: now, // Due immediately
    summaryHash: summaryHash,
    lastReviewedDate: undefined,
  };
}
