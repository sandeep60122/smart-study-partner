// src/ai/flows/process-ias-material.ts
'use server';

/**
 * @fileOverview Processes study material for IAS preparation, providing summary, insights, relevance, and debate points.
 *
 * - processIasMaterial - A function that processes study material for IAS context.
 * - ProcessIasMaterialInput - The input type for the processIasMaterial function.
 * - ProcessIasMaterialOutput - The return type for the processIasMaterial function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessIasMaterialInputSchema = z.object({
  material: z.string().describe('The study material (text or URL) to process for IAS preparation.'),
});
export type ProcessIasMaterialInput = z.infer<typeof ProcessIasMaterialInputSchema>;

const ProcessIasMaterialOutputSchema = z.object({
  iasSummary: z.string().describe('A concise summary of the material tailored for IAS aspirants.'),
  examRelevance: z.object({
      prelims: z.array(z.string()).describe('Bullet points explaining the relevance of the topic to UPSC Prelims.'),
      mains: z.array(z.string()).describe('Bullet points explaining the relevance of the topic to UPSC Mains (mentioning relevant GS papers if possible).'),
  }),
  keyInsights: z.array(z.string()).describe('Key insights and takeaways from the material relevant for the IAS exam perspective.'),
  debatePoints: z.object({
      topic: z.string().describe('A clear statement of the main debatable issue derived from the material.'),
      argumentsFor: z.array(z.string()).describe('Arguments supporting one side of the debate.'),
      argumentsAgainst: z.array(z.string()).describe('Arguments supporting the opposing side of the debate.'),
  }),
});
export type ProcessIasMaterialOutput = z.infer<typeof ProcessIasMaterialOutputSchema>;

export async function processIasMaterial(input: ProcessIasMaterialInput): Promise<ProcessIasMaterialOutput> {
  return processIasMaterialFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processIasMaterialPrompt',
  input: {schema: ProcessIasMaterialInputSchema},
  output: {schema: ProcessIasMaterialOutputSchema},
  prompt: `You are an expert UPSC IAS exam mentor. Analyze the following study material provided by an aspirant.

Material:
{{{material}}}

Your task is to process this material comprehensively for IAS exam preparation. Provide the output as a JSON object with the following structure:

1.  **iasSummary**: Create a concise summary (3-4 paragraphs) highlighting the core concepts and facts relevant for the IAS exam. Focus on aspects important for Prelims (objective facts, key terms) and Mains (analytical points, context, significance).
2.  **examRelevance**:
    *   **prelims**: List 3-5 bullet points explaining how this topic might be relevant for the UPSC Preliminary Exam (e.g., potential MCQs, factual recall areas).
    *   **mains**: List 3-5 bullet points explaining its relevance for the UPSC Main Exam. Mention specific General Studies (GS) papers (GS-I, GS-II, GS-III, GS-IV, Essay) where this topic could be asked. Explain *why* it's relevant (e.g., policy implications, ethical dimensions, socio-economic impact).
3.  **keyInsights**: Extract 5-7 bullet points covering the most crucial insights, critical analysis points, or important data/facts an aspirant should remember from this material for the exam.
4.  **debatePoints**: Identify the primary debatable issue or controversial aspect within the material.
    *   **topic**: State the core debate topic clearly in one sentence.
    *   **argumentsFor**: Provide 3-4 distinct bullet points arguing for one side of the debate.
    *   **argumentsAgainst**: Provide 3-4 distinct bullet points arguing for the opposing side of the debate. Ensure the arguments are balanced and represent valid perspectives.

Ensure the language is analytical, objective, and suitable for an IAS aspirant. Use clear and structured bullet points.
`,
   config: {
      temperature: 0.6, // Balance between factual and analytical
    }
});

const processIasMaterialFlow = ai.defineFlow(
  {
    name: 'processIasMaterialFlow',
    inputSchema: ProcessIasMaterialInputSchema,
    outputSchema: ProcessIasMaterialOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("AI failed to process the material. Please try again.");
    }
    // Add basic validation if needed, e.g., check if arrays are empty when they shouldn't be
    return output;
  }
);
