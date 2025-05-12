// src/components/flashcards.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { generateFlashcards } from '@/ai/flows/generate-flashcards';
import type { Flashcard } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Layers, ArrowLeft, ArrowRight, RotateCw, AlertCircle } from 'lucide-react';

interface FlashcardsProps {
  summary: string | null; // Receives summary from parent
}

export function Flashcards({ summary }: FlashcardsProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateFlashcards = async () => {
    if (!summary) {
      setError('Please generate a summary first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setFlashcards([]); // Clear previous flashcards
    setCurrentCardIndex(0);
    setIsFlipped(false);

    try {
      const result = await generateFlashcards({ summary });
      setFlashcards(result.flashcards);
    } catch (err) {
      console.error('Flashcard generation error:', err);
      setError('Failed to generate flashcards. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextCard = () => {
    setIsFlipped(false); // Reset flip state on navigation
     // Use setTimeout to allow flip animation to reset before changing card
    setTimeout(() => {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    }, 150); // Slightly less than half the flip duration
  };

  const handlePrevCard = () => {
     setIsFlipped(false); // Reset flip state on navigation
     // Use setTimeout to allow flip animation to reset before changing card
     setTimeout(() => {
       setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
     }, 150);
  };

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
  };

  useEffect(() => {
     // Reset flashcards if summary changes (e.g., new summary generated)
     setFlashcards([]);
     setCurrentCardIndex(0);
     setIsFlipped(false);
     setError(null);
   }, [summary]);

  const canGenerate = !!summary && !isLoading;
  const currentCard = flashcards[currentCardIndex];

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-6 h-6" /> Flashcards
        </CardTitle>
        <CardDescription>
          Generate flashcards from your summary or review existing ones.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <Button
           onClick={handleGenerateFlashcards}
           disabled={!canGenerate || isLoading}
           className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
         >
           {isLoading ? (
             <>
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
               Generating...
             </>
           ) : (
             'Generate Flashcards from Summary'
           )}
         </Button>


        {error && (
          <Alert variant="destructive">
             <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {flashcards.length > 0 && currentCard && !isLoading && (
          <div className="mt-6 space-y-4">
             <div className="text-center text-sm text-muted-foreground mb-2">
                Card {currentCardIndex + 1} of {flashcards.length}
              </div>
            {/* Flashcard display area */}
            <div className="relative h-64 perspective">
              <div className={`relative w-full h-full card-flip ${isFlipped ? 'flipped' : ''}`}>
                {/* Front of the card (Question) */}
                <div className="card-front">
                  <p className="text-lg font-semibold">{currentCard.question}</p>
                </div>
                {/* Back of the card (Answer) */}
                <div className="card-back">
                  <p>{currentCard.answer}</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-4 pt-4">
              <Button variant="outline" size="icon" onClick={handlePrevCard} aria-label="Previous card">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button variant="default" onClick={handleFlipCard} className="bg-accent hover:bg-accent/90 text-accent-foreground px-6">
                <RotateCw className="mr-2 h-4 w-4" /> Flip Card
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextCard} aria-label="Next card">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

         {flashcards.length === 0 && !isLoading && summary && !error && (
            <p className="text-muted-foreground text-center py-4">Click "Generate Flashcards" to create cards from your summary.</p>
         )}
         {!summary && !isLoading && (
            <p className="text-muted-foreground text-center py-4">Generate a summary first to enable flashcard creation.</p>
         )}

      </CardContent>
    </Card>
  );
}
