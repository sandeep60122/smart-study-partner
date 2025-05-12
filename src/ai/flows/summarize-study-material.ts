// src/ai/flows/summarize-study-material.ts
'use server';

/**
 * @fileOverview Summarizes study material from text or URL input.
 *
 * - summarizeStudyMaterial - A function that summarizes study material.
 * - SummarizeStudyMaterialInput - The input type for the summarizeStudyMaterial function.
 * - SummarizeStudyMaterialOutput - The return type for the summarizeStudyMaterial function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeStudyMaterialInputSchema = z.object({
  material: z.string().describe('The study material to summarize, can be text or a URL.'),
});
export type SummarizeStudyMaterialInput = z.infer<typeof SummarizeStudyMaterialInputSchema>;

const SummarizeStudyMaterialOutputSchema = z.object({
  summary: z.string().describe('The summary of the study material.'),
});
export type SummarizeStudyMaterialOutput = z.infer<typeof SummarizeStudyMaterialOutputSchema>;

export async function summarizeStudyMaterial(input: SummarizeStudyMaterialInput): Promise<SummarizeStudyMaterialOutput> {
  return summarizeStudyMaterialFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeStudyMaterialPrompt',
  input: {schema: SummarizeStudyMaterialInputSchema},
  output: {schema: SummarizeStudyMaterialOutputSchema},
  prompt: `You are an expert summarizer for study material.

  Please provide a concise and informative summary of the following study material:

  {{material}}`,
});

const summarizeStudyMaterialFlow = ai.defineFlow(
  {
    name: 'summarizeStudyMaterialFlow',
    inputSchema: SummarizeStudyMaterialInputSchema,
    outputSchema: SummarizeStudyMaterialOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
