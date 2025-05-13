// src/components/flashcards.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { generateFlashcards } from '@/ai/flows/generate-flashcards';
import type { Flashcard } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Layers, ArrowLeft, ArrowRight, RotateCw, AlertCircle, CalendarClock } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
// import { calculateSrsReview, initializeSrsData } from '@/hooks/use-srs'; // SRS calculation might be removed or simplified
import { useToast } from "@/hooks/use-toast";

interface FlashcardsProps {
  summary: string | null;
  summaryHash: string | null; // Used for keying localStorage
  username: string | null; // Used for keying localStorage
}

const EMPTY_FLASHCARDS: Flashcard[] = [];

export function Flashcards({ summary, summaryHash, username }: FlashcardsProps) {
  const storageKey = username && summaryHash ? `ias-catalyst-flashcards-${username}-${summaryHash}` : null;
  const [storedFlashcards, setStoredFlashcards] = useLocalStorage<Flashcard[]>(storageKey || '_disabled_flashcards', EMPTY_FLASHCARDS);

  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>([]); // All cards for current summary
  const [reviewQueue, setReviewQueue] = useState<Flashcard[]>([]); // Cards currently due for review

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false); // To switch between all cards and due cards

  const { toast } = useToast();

  // Load flashcards from storage or generate if summary changes
  useEffect(() => {
    if (storageKey) {
      setAllFlashcards(storedFlashcards.length > 0 ? storedFlashcards : []);
    } else {
      setAllFlashcards([]); // Clear if no valid key
    }
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setReviewMode(false);
    setError(null);
  }, [storageKey, summary, storedFlashcards]);

  const updateReviewQueue = useCallback(() => {
    const now = Date.now();
    const dueCards = allFlashcards
      .filter(card => card.dueDate <= now)
      .sort((a, b) => a.dueDate - b.dueDate);
    setReviewQueue(dueCards);
  }, [allFlashcards]);

  useEffect(() => {
    updateReviewQueue();
  }, [allFlashcards, updateReviewQueue]);

  const handleGenerateFlashcards = async () => {
    if (!summary || !username || !summaryHash) {
      setError('Summary or user information is missing.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateFlashcards({ summary, summaryHash });
      setAllFlashcards(result.flashcards);
      setStoredFlashcards(result.flashcards); // Save to localStorage
      setReviewMode(false);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      toast({ title: "Flashcards Generated!", description: `${result.flashcards.length} cards created.`});
    } catch (err) {
      console.error('Flashcard generation error:', err);
      setError('Failed to generate flashcards. Please try again.');
      toast({ title: "Error", description: "Could not generate flashcards.", variant: "destructive"});
    } finally {
      setIsLoading(false);
    }
  };

  // SRS Grading buttons and handleReviewCard are removed as per request.
  // The reviewQueue will still populate, but cards won't be actively removed
  // from it or rescheduled through UI grading actions on this tab.

  const activeCardList = reviewMode ? reviewQueue : allFlashcards;
  const currentCard = activeCardList[currentCardIndex];

  const handleNextCard = () => {
    if (activeCardList.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % activeCardList.length);
    }, 150);
  };

  const handlePrevCard = () => {
    if (activeCardList.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prevIndex) => (prevIndex - 1 + activeCardList.length) % activeCardList.length);
    }, 150);
  };

  const handleFlipCard = () => setIsFlipped(!isFlipped);

  const toggleReviewMode = () => {
    if (!reviewMode && reviewQueue.length > 0) {
        setReviewMode(true);
        setCurrentCardIndex(0);
        setIsFlipped(false);
    } else if (reviewMode) {
        setReviewMode(false);
        setCurrentCardIndex(0);
        setIsFlipped(false);
    } else {
        toast({title: "No Cards Due", description: "You're all caught up!"});
    }
  };

  const canGenerate = !!summary && !!username && !!summaryHash && !isLoading;

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
            <CardTitle className="flex items-center gap-2">
            <Layers className="w-6 h-6" /> Flashcards
            </CardTitle>
            {allFlashcards.length > 0 && (
                <Button onClick={toggleReviewMode} variant="outline" size="sm" className="w-full sm:w-auto">
                    <CalendarClock className="mr-2 h-4 w-4" />
                    {reviewMode ? "Browse All Cards" : `Review Due (${reviewQueue.length})`}
                </Button>
            )}
        </div>
        <CardDescription>
          {reviewMode ? `Reviewing ${reviewQueue.length} due card(s).` : 'Generate or review flashcards.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGenerateFlashcards} disabled={!canGenerate} className="w-full">
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : 'Generate Flashcards'}
        </Button>

        {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

        {activeCardList.length > 0 && currentCard && !isLoading ? (
          <div className="mt-6 space-y-4">
            <div className="text-center text-sm text-muted-foreground mb-2">
              Card {currentCardIndex + 1} of {activeCardList.length}
              {/* Due date display removed as per request */}
            </div>
            <div className="relative h-56 sm:h-64 perspective" onClick={handleFlipCard} style={{cursor: 'pointer'}}>
              <div className={`relative w-full h-full card-flip ${isFlipped ? 'flipped' : ''}`}>
                <div className="card-front"><p className="text-base sm:text-lg font-semibold">{currentCard.question}</p></div>
                <div className="card-back"><p className="text-sm sm:text-base">{currentCard.answer}</p></div>
              </div>
            </div>

            {/* SRS Grading Buttons Removed */}

            {/* Navigation controls remain */}
            {(activeCardList.length > 1 || isFlipped) && (
                 <div className="flex justify-center items-center gap-4 pt-4">
                    {activeCardList.length > 1 && !isFlipped && <Button variant="outline" size="icon" onClick={handlePrevCard} aria-label="Previous card"><ArrowLeft className="h-4 w-4" /></Button>}
                    <Button variant="default" onClick={handleFlipCard} className="px-6"><RotateCw className="mr-2 h-4 w-4" /> {isFlipped ? 'Show Question' : 'Show Answer'}</Button>
                    {activeCardList.length > 1 && !isFlipped && <Button variant="outline" size="icon" onClick={handleNextCard} aria-label="Next card"><ArrowRight className="h-4 w-4" /></Button>}
                     {isFlipped && activeCardList.length > 0 && ( // Show next card button when flipped and in review mode, or if browsing all
                         <Button variant="outline" onClick={handleNextCard} aria-label="Next card">
                            <ArrowRight className="h-4 w-4 mr-2" /> Next Card
                         </Button>
                     )}
                 </div>
            )}

          </div>
        ) : !isLoading && (
          <p className="text-muted-foreground text-center py-4">
            {summary ? 'Generate flashcards or switch to "Review Due" mode.' : 'Generate a summary first to create flashcards.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}