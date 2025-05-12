// src/components/aptitude-solver.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Calculator, BookOpen, Lightbulb, AlertCircle } from 'lucide-react';
import { generateAptitudeHelp, GenerateAptitudeHelpOutput } from '@/ai/flows/generate-aptitude-help';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function AptitudeSolver() {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<GenerateAptitudeHelpOutput | null>(null);

    const handleGetHelp = async () => {
        if (!inputValue.trim()) {
          setError('Please enter an aptitude question or topic.');
          return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null); // Clear previous result

        try {
          const aiResult = await generateAptitudeHelp({ questionOrTopic: inputValue });
          setResult(aiResult);
        } catch (err) {
          console.error('Aptitude help error:', err);
          setError(err instanceof Error ? err.message : 'Failed to get help. Please check the input or try again later.');
        } finally {
          setIsLoading(false);
        }
      };

  return (
    <Card className="w-full max-w-3xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
          <Calculator className="w-6 h-6 sm:w-7 sm:h-7 text-primary" /> Aptitude Helper
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Enter an aptitude question or topic (e.g., "percentages," "time and work," "simple interest formula") to get relevant formulas and explanations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6">
        {/* Input Section */}
         <Card className="bg-card shadow-sm border border-border/50">
             <CardHeader>
                <CardTitle className="text-lg">Enter Question or Topic</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                 <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="e.g., How to calculate compound interest? or A train travels..."
                    rows={5}
                    className="resize-y"
                    aria-label="Aptitude question or topic input"
                  />

                {error && (
                  <Alert variant="destructive">
                     <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
             </CardContent>
             <CardFooter className="flex justify-end">
                <Button onClick={handleGetHelp} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting Help...
                    </>
                  ) : (
                    'Get Formulas & Help'
                  )}
                </Button>
              </CardFooter>
         </Card>

        {/* Display Results Section */}
        {isLoading && (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )}

        {result && !isLoading && (
            <div className="space-y-6 mt-6">
                 <Card>
                     <CardHeader>
                       <CardTitle className="text-lg">Aptitude Help for: <span className="text-primary">{result.identifiedTopic}</span></CardTitle>
                     </CardHeader>
                     <CardContent>
                         <Accordion type="multiple" className="w-full space-y-4" defaultValue={['formulas']}>
                             <AccordionItem value="formulas" className="border rounded-lg px-4 bg-card">
                                 <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                     <div className="flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-primary" /> Relevant Formulas
                                     </div>
                                 </AccordionTrigger>
                                 <AccordionContent className="space-y-3 pt-2 pl-2">
                                    {result.relevantFormulas.length > 0 ? (
                                        result.relevantFormulas.map((f, index) => (
                                            <div key={index} className="py-2 border-b border-border/50 last:border-b-0">
                                                <p className="font-semibold text-base">{f.name}</p>
                                                <p className="font-mono text-sm bg-muted/50 px-2 py-1 rounded inline-block my-1">{f.formula}</p>
                                                {f.description && <p className="text-xs text-muted-foreground">{f.description}</p>}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No specific formulas found for this topic/question.</p>
                                    )}
                                 </AccordionContent>
                             </AccordionItem>

                             {result.keyConcepts && result.keyConcepts.length > 0 && (
                                 <AccordionItem value="concepts" className="border rounded-lg px-4 bg-card">
                                     <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                         <div className="flex items-center gap-2">
                                            <Lightbulb className="w-5 h-5 text-primary" /> Key Concepts
                                         </div>
                                     </AccordionTrigger>
                                     <AccordionContent className="space-y-3 pt-2 pl-2">
                                         <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
                                             {result.keyConcepts.map((concept, index) => <li key={`concept-${index}`}>{concept}</li>)}
                                         </ul>
                                     </AccordionContent>
                                 </AccordionItem>
                             )}

                             {result.explanationSteps && result.explanationSteps.length > 0 && (
                                 <AccordionItem value="explanation" className="border rounded-lg px-4 bg-card">
                                     <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                         <div className="flex items-center gap-2">
                                             <Lightbulb className="w-5 h-5 text-primary" /> Explanation / Steps
                                         </div>
                                     </AccordionTrigger>
                                     <AccordionContent className="space-y-3 pt-2 pl-2">
                                         <ol className="list-decimal list-inside space-y-1 text-sm text-foreground/90 pl-4">
                                             {result.explanationSteps.map((step, index) => <li key={`step-${index}`}>{step}</li>)}
                                         </ol>
                                     </AccordionContent>
                                 </AccordionItem>
                              )}
                         </Accordion>
                     </CardContent>
                 </Card>
            </div>
        )}

      </CardContent>
    </Card>
  );
}
