// src/components/explanation.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { generateExplanation } from '@/ai/flows/generate-explanation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Lightbulb, AlertCircle } from 'lucide-react';

interface ExplanationProps {
  summary: string | null; // Receives summary from parent
}

export function Explanation({ summary }: ExplanationProps) {
  const [explanationPoints, setExplanationPoints] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateExplanation = async () => {
    if (!summary) {
      setError('Please generate a summary first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setExplanationPoints([]); // Clear previous explanation

    try {
      const result = await generateExplanation({ summary });
      setExplanationPoints(result.explanationPoints);
    } catch (err) {
      console.error('Explanation generation error:', err);
      setError('Failed to generate explanation. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
     // Reset explanation if summary changes
     setExplanationPoints([]);
     setError(null);
   }, [summary]);

  const canGenerate = !!summary && !isLoading;

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-6 h-6" /> AI Explanation (for a 10-year-old)
        </CardTitle>
        <CardDescription>
          Get a simple, bullet-point explanation of your summary.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <Button
           onClick={handleGenerateExplanation}
           disabled={!canGenerate || isLoading}
           className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
         >
           {isLoading ? (
             <>
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
               Generating Explanation...
             </>
           ) : (
             'Explain This Summary'
           )}
         </Button>

        {error && (
          <Alert variant="destructive">
             <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {explanationPoints.length > 0 && !isLoading && (
          <div className="mt-6 space-y-3 bg-secondary/30 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-2">Here's a simple explanation:</h3>
            <ul className="list-disc list-inside space-y-1 text-foreground/90">
              {explanationPoints.map((point, index) => (
                <li key={index} className="ml-2">{point}</li>
              ))}
            </ul>
          </div>
        )}

         {explanationPoints.length === 0 && !isLoading && summary && !error && (
            <p className="text-muted-foreground text-center py-4">Click "Explain This Summary" to get a simple breakdown.</p>
         )}
         {!summary && !isLoading && (
            <p className="text-muted-foreground text-center py-4">Generate a summary first to enable explanation.</p>
         )}

      </CardContent>
    </Card>
  );
}
