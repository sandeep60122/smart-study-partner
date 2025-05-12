import { config } from 'dotenv';
config();

import '@/ai/flows/generate-flashcards.ts';
import '@/ai/flows/summarize-study-material.ts';
import '@/ai/flows/generate-quiz.ts'; // Add the new quiz flow
import '@/ai/flows/generate-explanation.ts'; // Add the new explanation flow
import '@/ai/flows/process-ias-material.ts'; // Add the new IAS material processing flow
import '@/ai/flows/generate-aptitude-help.ts'; // Add the new aptitude help flow

