// src/ai/flows/generate-aptitude-help.ts
'use server';

/**
 * @fileOverview Aptitude question help AI agent, providing relevant formulas and explanation.
 *
 * - generateAptitudeHelp - A function that handles the aptitude help generation process.
 * - GenerateAptitudeHelpInput - The input type for the generateAptitudeHelp function.
 * - GenerateAptitudeHelpOutput - The return type for the generateAptitudeHelp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAptitudeHelpInputSchema = z.object({
  questionOrTopic: z.string().describe('The aptitude question or topic submitted by the user.'),
});
export type GenerateAptitudeHelpInput = z.infer<typeof GenerateAptitudeHelpInputSchema>;

const FormulaSchema = z.object({
    name: z.string().describe('The common name or identifier of the formula (e.g., "Simple Interest", "Area of a Circle").'),
    formula: z.string().describe('The mathematical formula itself (e.g., "SI = P * R * T / 100", "A = πr²").'),
    description: z.string().optional().describe('A brief explanation of the formula or its variables.'),
});

const GenerateAptitudeHelpOutputSchema = z.object({
  identifiedTopic: z.string().describe('The specific aptitude topic identified from the input (e.g., "Percentages", "Time and Work", "Geometry").'),
  relevantFormulas: z.array(FormulaSchema).describe('An array of formulas relevant to the identified topic or question.'),
  explanationSteps: z.array(z.string()).optional().describe('Optional: Step-by-step explanation or approach to solve the specific question, if provided.'),
  keyConcepts: z.array(z.string()).optional().describe('Optional: Key concepts related to the topic.'),
});
export type GenerateAptitudeHelpOutput = z.infer<typeof GenerateAptitudeHelpOutputSchema>;

export async function generateAptitudeHelp(input: GenerateAptitudeHelpInput): Promise<GenerateAptitudeHelpOutput> {
  return generateAptitudeHelpFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAptitudeHelpPrompt',
  input: {schema: GenerateAptitudeHelpInputSchema},
  output: {schema: GenerateAptitudeHelpOutputSchema},
  prompt: `You are an expert aptitude tutor specializing in quantitative and logical reasoning problems.
A user has submitted the following aptitude question or topic:

"{{{questionOrTopic}}}"

Your task is to analyze the input and provide relevant help. Follow these steps:

1.  **Identify the Core Topic:** Determine the main mathematical or logical concept involved (e.g., Percentages, Simple Interest, Time and Work, Geometry, Ratios, Permutations, etc.). Set this in the "identifiedTopic" field.
2.  **Extract Relevant Formulas:** Provide a list of key formulas directly related to the identified topic. For each formula, include its common name, the formula itself, and optionally a brief description of its variables or use case. Populate the "relevantFormulas" array.
3.  **Explain Steps (Optional but Recommended):** If the input is a specific question, provide a clear, step-by-step explanation of how to solve it using the relevant formulas or concepts. Populate the "explanationSteps" array. If the input is just a topic, this can be omitted or contain general steps.
4.  **Key Concepts (Optional):** Briefly list 1-3 key underlying concepts or definitions necessary to understand the topic. Populate the "keyConcepts" array.

Present the output as a JSON object matching the defined output schema. Ensure formulas are clearly written.
Prioritize providing the correct and most relevant formulas for the identified topic.
`,
  config: {
    temperature: 0.5, // Focus on accuracy for formulas
  },
});

const generateAptitudeHelpFlow = ai.defineFlow(
  {
    name: 'generateAptitudeHelpFlow',
    inputSchema: GenerateAptitudeHelpInputSchema,
    outputSchema: GenerateAptitudeHelpOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate aptitude help. Please try again.");
    }
    // Ensure relevantFormulas is always an array, even if AI fails partially
    if (!output.relevantFormulas) {
        output.relevantFormulas = [];
    }
    return output;
  }
);
