// src/ai/flows/generate-explanation.ts
'use server';

/**
 * @fileOverview Explanation generation AI agent.
 *
 * - generateExplanation - A function that handles the explanation generation process.
 * - GenerateExplanationInput - The input type for the generateExplanation function.
 * - GenerateExplanationOutput - The return type for the generateExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExplanationInputSchema = z.object({
  summary: z.string().describe('The summarized content to generate an explanation from.'),
});
export type GenerateExplanationInput = z.infer<typeof GenerateExplanationInputSchema>;

const GenerateExplanationOutputSchema = z.object({
  explanationPoints: z
    .array(z.string())
    .describe('An array of bullet points explaining the summary in simple terms for a 10-year-old.'),
});
export type GenerateExplanationOutput = z.infer<typeof GenerateExplanationOutputSchema>;

export async function generateExplanation(input: GenerateExplanationInput): Promise<GenerateExplanationOutput> {
  return generateExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExplanationPrompt',
  input: {schema: GenerateExplanationInputSchema},
  output: {schema: GenerateExplanationOutputSchema},
  prompt: `You are a friendly and patient teacher who is an expert at explaining complex ideas to 10-year-old children.
Please read the following summary and explain its main points in a list of simple bullet points.
Each bullet point should be a short, easy-to-understand sentence. Imagine you're talking directly to a curious 10-year-old.

Summary:
{{{summary}}}

Provide the explanation as a JSON object with a key "explanationPoints" which is an array of strings (the bullet points).
Ensure the language is simple, clear, and engaging for a child. Avoid jargon and complex vocabulary.
`,
  config: {
    temperature: 0.7, // Slightly creative but still factual
  }
});

const generateExplanationFlow = ai.defineFlow(
  {
    name: 'generateExplanationFlow',
    inputSchema: GenerateExplanationInputSchema,
    outputSchema: GenerateExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure output is not null and explanationPoints exists
    if (!output || !output.explanationPoints) {
        // Fallback or error handling if AI doesn't return expected structure
        console.error("AI did not return valid explanation points. Input:", input);
        return { explanationPoints: ["Sorry, I couldn't generate an explanation right now. Please try again."] };
    }
    return output;
  }
);
