// src/components/flashcards.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { generateFlashcards } from '@/ai/flows/generate-flashcards';
import type { Flashcard } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Layers, ArrowLeft, ArrowRight, RotateCw, Check, X, AlertCircle, CalendarClock } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import { calculateSrsReview, initializeSrsData } from '@/hooks/use-srs';
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
      // `storedFlashcards` is updated by useLocalStorage when key changes or storage event fires
      setAllFlashcards(storedFlashcards.length > 0 ? storedFlashcards : []);
      if (storedFlashcards.length === 0 && summary) {
        // If no cards in storage for this summary, but summary exists, prompt to generate
        // Or auto-generate? For now, let user click.
      }
    } else {
      setAllFlashcards([]); // Clear if no valid key
    }
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setReviewMode(false); // Default to browsing all cards
    setError(null);
  }, [storageKey, summary, storedFlashcards]); 
  // Adding storedFlashcards to dependency array to react to its updates from useLocalStorage

  const updateReviewQueue = useCallback(() => {
    const now = Date.now();
    const dueCards = allFlashcards
      .filter(card => card.dueDate <= now)
      .sort((a, b) => a.dueDate - b.dueDate); // Oldest due first
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
      setReviewMode(false); // Switch to browse newly generated cards
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

  const handleReviewCard = (quality: 0 | 1 | 2 | 3) => {
    const currentCards = reviewMode ? reviewQueue : allFlashcards;
    if (!currentCards[currentCardIndex]) return;

    const cardToReview = currentCards[currentCardIndex];
    const { updatedCard } = calculateSrsReview(cardToReview, quality);

    // Update this card in the main `allFlashcards` list
    const updatedAllFlashcards = allFlashcards.map(card =>
      card.id === updatedCard.id ? updatedCard : card
    );
    setAllFlashcards(updatedAllFlashcards);
    setStoredFlashcards(updatedAllFlashcards); // Persist change

    // If in review mode, automatically go to the next due card or end review
    if (reviewMode) {
        // Remove the just-reviewed card from the current (local) reviewQueue and go to next
        const nextReviewQueue = reviewQueue.filter(c => c.id !== cardToReview.id);
        setReviewQueue(nextReviewQueue); // This will be further filtered by updateReviewQueue effect if needed
        
        if (nextReviewQueue.length > 0) {
            setCurrentCardIndex(0); // Go to the start of the new (shorter) queue
            setIsFlipped(false);
        } else {
            setReviewMode(false); // No more cards in this review session
            toast({ title: "Review Complete!", description: "All due cards reviewed."});
        }
    } else {
        // If browsing all cards, just update and stay on current (or move if preferred)
        handleNextCard(); // Or simply re-render current with updated data
    }
  };

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
        setCurrentCardIndex(0); // Reset to browse all cards
        setIsFlipped(false);
    } else {
        toast({title: "No Cards Due", description: "You're all caught up!"});
    }
  };

  const canGenerate = !!summary && !!username && !!summaryHash && !isLoading;

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
            <Layers className="w-6 h-6" /> Flashcards
            </CardTitle>
            {allFlashcards.length > 0 && (
                <Button onClick={toggleReviewMode} variant="outline" size="sm">
                    <CalendarClock className="mr-2 h-4 w-4" />
                    {reviewMode ? "Browse All Cards" : `Review Due (${reviewQueue.length})`}
                </Button>
            )}
        </div>
        <CardDescription>
          {reviewMode ? `Reviewing ${reviewQueue.length} due card(s).` : 'Generate or review flashcards. Due dates use Spaced Repetition.'}
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
              {currentCard.dueDate && <span className="ml-2">(Due: {new Date(currentCard.dueDate).toLocaleDateString()})</span>}
            </div>
            <div className="relative h-64 perspective" onClick={handleFlipCard} style={{cursor: 'pointer'}}>
              <div className={`relative w-full h-full card-flip ${isFlipped ? 'flipped' : ''}`}>
                <div className="card-front"><p className="text-lg font-semibold">{currentCard.question}</p></div>
                <div className="card-back"><p>{currentCard.answer}</p></div>
              </div>
            </div>

            {isFlipped && ( // Show SRS controls when card is flipped (showing answer)
              <div className="flex justify-around items-center pt-4">
                <Button variant="destructive" onClick={() => handleReviewCard(0)} className="bg-red-600 hover:bg-red-700">
                  <X className="mr-2 h-4 w-4" /> Incorrect
                </Button>
                <Button variant="default" onClick={() => handleReviewCard(2)} className="bg-green-600 hover:bg-green-700">
                  <Check className="mr-2 h-4 w-4" /> Correct
                </Button>
              </div>
            )}

            {!isFlipped && activeCardList.length > 1 && ( // Navigation when not flipped
                 <div className="flex justify-center items-center gap-4 pt-4">
                    <Button variant="outline" size="icon" onClick={handlePrevCard} aria-label="Previous card"><ArrowLeft className="h-4 w-4" /></Button>
                    <Button variant="default" onClick={handleFlipCard} className="px-6"><RotateCw className="mr-2 h-4 w-4" /> Flip Card</Button>
                    <Button variant="outline" size="icon" onClick={handleNextCard} aria-label="Next card"><ArrowRight className="h-4 w-4" /></Button>
                 </div>
            )}
             {!isFlipped && activeCardList.length === 1 && ( // Just flip button if only one card
                 <div className="flex justify-center items-center gap-4 pt-4">
                    <Button variant="default" onClick={handleFlipCard} className="px-6"><RotateCw className="mr-2 h-4 w-4" /> Flip Card</Button>
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
