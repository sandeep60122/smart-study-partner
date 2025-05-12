// src/ai/flows/generate-quiz.ts
'use server';

/**
 * @fileOverview Quiz generation AI agent.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  summary: z.string().describe('The summarized content to generate a quiz from.'),
  numQuestions: z.number().int().positive().optional().default(5).describe('Number of quiz questions to generate.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const QuizQuestionSchema = z.object({
    question: z.string().describe('The text of the quiz question.'),
    options: z.array(z.string()).describe('An array of possible answers (multiple choice options).'),
    correctAnswer: z.string().describe('The correct answer text from the options array.'), // Store correct answer text for easier comparison later
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;


const GenerateQuizOutputSchema = z.object({
  quizTitle: z.string().describe('A short, relevant title for the quiz based on the summary content.'),
  questions: z.array(QuizQuestionSchema).describe('An array of quiz questions generated from the summarized content.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;


export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert educator creating a multiple-choice quiz to test understanding of the provided summary.

  Summary:
  {{{summary}}}

  Please generate a quiz based on this summary with the following requirements:
  1.  Create exactly {{{numQuestions}}} multiple-choice questions.
  2.  Each question should have 4 distinct options.
  3.  Clearly indicate the correct answer for each question.
  4.  Generate a short, relevant title for the quiz (e.g., "Key Concepts of [Topic]").

  Format the output as a JSON object containing:
  - "quizTitle": The generated title for the quiz.
  - "questions": An array of question objects. Each object should have:
      - "question": The question text.
      - "options": An array of 4 answer strings.
      - "correctAnswer": The string of the correct answer from the options array.
  `,
  config: {
    // Increase temperature slightly for more varied questions/options
    temperature: 0.8,
  }
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    // Basic validation to ensure the number of questions matches the request
    if (output && output.questions.length !== input.numQuestions) {
       console.warn(`AI generated ${output.questions.length} questions, but ${input.numQuestions} were requested.`);
       // Optional: Could add logic here to truncate/pad or error out,
       // but for now we'll return what the AI gave.
     }
    return output!;
  }
);

