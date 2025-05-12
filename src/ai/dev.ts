import { config } from 'dotenv';
config();

import '@/ai/flows/generate-flashcards.ts';
import '@/ai/flows/summarize-study-material.ts';
import '@/ai/flows/generate-quiz.ts'; // Add the new quiz flow
import '@/ai/flows/generate-explanation.ts'; // Add the new explanation flow

