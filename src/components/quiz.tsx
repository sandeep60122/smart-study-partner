// src/components/quiz.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import type { QuizQuestion, QuizResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, HelpCircle, CheckCircle, XCircle, RotateCcw, History, AlertCircle } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import { useToast } from "@/hooks/use-toast"; // Import useToast


interface QuizProps {
  summary: string | null;
  username: string | null; // Needed for storing results per user
}

const EMPTY_QUIZ_RESULTS: QuizResult[] = [];

export function Quiz({ summary, username }: QuizProps) {
  const storageKey = username ? `ias-catalyst-quiz-results-${username}` : null;
  const [quizResults, setQuizResults] = useLocalStorage<QuizResult[]>(storageKey || '_disabled', EMPTY_QUIZ_RESULTS);
  const [isClient, setIsClient] = useState(false); // Add isClient state

  const [quizTitle, setQuizTitle] = useState<string>('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false); // Default to false, will be set by effect

  const { toast } = useToast(); // Initialize toast

  // Simple hash function for summary comparison (optional)
  const generateSummaryHash = (s: string | null): string => {
     if (!s) return 'no-summary';
     let hash = 0;
     for (let i = 0; i < s.length; i++) {
       const char = s.charCodeAt(i);
       hash = (hash << 5) - hash + char;
       hash |= 0; // Convert to 32bit integer
     }
     return hash.toString();
   };

  const summaryHash = useMemo(() => generateSummaryHash(summary), [summary]);

  // Effect to check if client-side
  useEffect(() => {
    setIsClient(true); // Mark as client-side mounted
  }, []);

  // Effect to show history by default if results exist on the client
  useEffect(() => {
    // Only run on the client after quizResults are potentially loaded/hydrated
    // Initialize showHistory based on results, but don't force it back to false later
    if (isClient && quizResults.length > 0 && !showHistory) {
       // Only set to true initially if results exist and history isn't already shown
      setShowHistory(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, quizResults]); // Re-evaluate when client status or results change


  const handleGenerateQuiz = async () => {
    if (!summary) {
      setError('Please generate a summary first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    resetQuizState(); // Reset everything before generating

    try {
      const result = await generateQuiz({ summary });
      if (result.questions && result.questions.length > 0) {
        setQuizTitle(result.quizTitle);
        setQuizQuestions(result.questions);
        setUserAnswers(new Array(result.questions.length).fill(null));
        setShowHistory(false); // Switch view to the new quiz
      } else {
        setError('The generated quiz has no questions. Please try again.');
      }
    } catch (err) {
      console.error('Quiz generation error:', err);
      setError('Failed to generate quiz. Please try again later.');
       toast({ // Toast notification for error
         title: "Quiz Generation Failed",
         description: "Could not generate the quiz. Please check the summary or try again.",
         variant: "destructive",
       });
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuizState = () => {
     setQuizTitle('');
     setQuizQuestions([]);
     setCurrentQuestionIndex(0);
     setUserAnswers([]);
     setIsQuizComplete(false);
     setScore(0);
     setError(null);
     // Don't reset showHistory here, allow user to toggle it
     // setShowHistory(false);
  }

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    quizQuestions.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });
    const finalScore = correctCount;
    const totalQuestions = quizQuestions.length;
    const percentage = totalQuestions > 0 ? Math.round((finalScore / totalQuestions) * 100) : 0;

    setScore(finalScore);
    setIsQuizComplete(true);

    // Save result to localStorage if username is available
    if (storageKey) {
       const newResult: QuizResult = {
         id: `${summaryHash}-${Date.now()}`, // Combine hash and timestamp for a unique ID
         quizTitle: quizTitle || 'Untitled Quiz',
         summaryHash: summaryHash,
         score: finalScore,
         totalQuestions: totalQuestions,
         percentage: percentage,
         userAnswers: userAnswers,
         timestamp: Date.now(),
       };
       setQuizResults(prevResults => [newResult, ...prevResults].slice(0, 20)); // Keep latest 20 results
        toast({ // Toast notification for success
           title: "Quiz Completed!",
           description: `You scored ${finalScore}/${totalQuestions} (${percentage}%). Result saved.`,
         });
    } else {
       console.warn("Username not available, quiz result not saved.");
        toast({ // Toast notification for warning
           title: "Quiz Completed",
           description: `You scored ${finalScore}/${totalQuestions} (${percentage}%). Log in to save results.`,
           variant: "default", // Use default variant for warnings or info
         });
    }
  };

  const handleRetakeQuiz = () => {
     // Reset answers and completion state, keep questions and title
     setCurrentQuestionIndex(0);
     setUserAnswers(new Array(quizQuestions.length).fill(null));
     setIsQuizComplete(false);
     setScore(0);
     setError(null); // Clear any previous errors
     setShowHistory(false); // Hide history view, show the quiz questions again
  }

  const handleToggleHistory = () => {
     setShowHistory(!showHistory);
      // If we are toggling history off, and there's an active (but maybe incomplete) quiz,
      // keep the quiz state. If no active quiz, user will see generate button.
  }

   // Effect to reset quiz content (not history view) when summary changes
  useEffect(() => {
      // Only reset the active quiz content, not the history view flag
      setQuizTitle('');
      setQuizQuestions([]);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setIsQuizComplete(false);
      setScore(0);
      setError(null);
      // Do not change showHistory here based on summary change.
  }, [summary]);


  const currentQuestion = quizQuestions[currentQuestionIndex];
  const canGenerate = !!summary && !isLoading;
  const canSubmit = userAnswers[currentQuestionIndex] !== null;

  // Helper to format date
   const formatDate = (timestamp: number) => {
     return new Date(timestamp).toLocaleString();
   };

   // Determine if history should be shown based on state AND client-side readiness
   const displayHistory = showHistory && isClient;

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6" /> Quiz Time!
            </CardTitle>
            {/* Only show toggle history button if there are results or if currently showing history */}
            {(quizResults.length > 0 || showHistory) && isClient && (
                <Button variant="outline" size="sm" onClick={handleToggleHistory}>
                    <History className="w-4 h-4 mr-2" />
                    {showHistory ? 'Take/Generate Quiz' : 'View History'}
                </Button>
            )}
        </div>
        <CardDescription>
           {displayHistory
            ? `Viewing past quiz results for ${username}. Toggle off to generate/take a new quiz.`
            : quizTitle && quizQuestions.length > 0 && !isQuizComplete // Added checks here
              ? `Quiz: ${quizTitle}`
              : 'Generate a quiz from your summary or view history.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Only show generate button when NOT viewing history */}
        {!displayHistory && (
          <Button
            onClick={handleGenerateQuiz}
            disabled={!canGenerate || isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              'Generate Quiz from Summary'
            )}
          </Button>
        )}

        {error && !isLoading && !displayHistory && ( // Only show error if not in history view
          <Alert variant="destructive">
             <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quiz History View */}
        {displayHistory && (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                 <h3 className="text-lg font-semibold border-b pb-2">Quiz History</h3>
                 {quizResults.length === 0 ? (
                     <p className="text-muted-foreground text-center">No quiz results found for {username}.</p>
                 ) : (
                     quizResults.map((result) => (
                         <Card key={result.id} className="bg-muted/50 p-4">
                             <p className="font-medium">{result.quizTitle}</p>
                             <p className="text-sm text-muted-foreground">Taken: {formatDate(result.timestamp)}</p>
                             <p className="text-sm">Score: {result.score}/{result.totalQuestions} ({result.percentage}%)</p>
                             {/* Optional: Add button to view detailed answers */}
                         </Card>
                     ))
                 )}
            </div>
        )}


        {/* Quiz Taking View */}
        {!displayHistory && quizQuestions.length > 0 && !isQuizComplete && currentQuestion && !isLoading && (
          <div className="space-y-4">
            <Progress value={((currentQuestionIndex + 1) / quizQuestions.length) * 100} className="w-full h-2" />
            <p className="text-sm text-muted-foreground text-center">Question {currentQuestionIndex + 1} of {quizQuestions.length}</p>
            <Card className="p-4 bg-card">
                <p className="font-semibold text-lg mb-4">{currentQuestion.question}</p>
                <RadioGroup
                    value={userAnswers[currentQuestionIndex] ?? undefined}
                    onValueChange={handleAnswerSelect}
                    className="space-y-2"
                >
                    {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 rounded border border-transparent hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10 transition-colors">
                        <RadioGroupItem value={option} id={`q${currentQuestionIndex}-o${index}`} />
                        <Label htmlFor={`q${currentQuestionIndex}-o${index}`} className="flex-1 cursor-pointer">{option}</Label>
                    </div>
                    ))}
                </RadioGroup>
             </Card>
             <CardFooter className="justify-end pt-4">
                <Button onClick={handleNextQuestion} disabled={!canSubmit}>
                    {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Submit Quiz'}
                </Button>
             </CardFooter>
          </div>
        )}

        {/* Quiz Results View */}
        {!displayHistory && isQuizComplete && (
          <div className="text-center space-y-4 p-6 bg-secondary/50 rounded-lg">
            <h2 className="text-2xl font-bold">Quiz Complete!</h2>
            <p className="text-xl">Your Score: <span className="font-bold text-primary">{score}</span> out of {quizQuestions.length}</p>
            <p className="text-3xl font-bold text-accent">{((score / quizQuestions.length) * 100).toFixed(0)}%</p>
            <div className="flex justify-center gap-4 pt-4">
                <Button onClick={handleRetakeQuiz} variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" /> Retake Quiz
                </Button>
                 {/* Allow generating a new quiz even after completing one */}
                <Button onClick={handleGenerateQuiz} disabled={!canGenerate || isLoading}>
                   {isLoading ? 'Generating...' : 'Generate New Quiz'}
                </Button>
             </div>
            {/* Optional: Show correct/incorrect answers breakdown */}
            <div className="mt-6 text-left max-h-60 overflow-y-auto space-y-3 pr-2">
                 <h3 className="text-lg font-semibold border-b pb-1 mb-2">Review Answers</h3>
                 {quizQuestions.map((q, index) => (
                    <div key={index} className={`p-2 border rounded ${userAnswers[index] === q.correctAnswer ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
                        <p className="font-medium">{index + 1}. {q.question}</p>
                        <p className="text-sm">Your answer: <span className="font-semibold">{userAnswers[index] ?? 'Not answered'}</span></p>
                         {userAnswers[index] !== q.correctAnswer && (
                            <p className="text-sm text-green-700 dark:text-green-400">Correct answer: <span className="font-semibold">{q.correctAnswer}</span></p>
                         )}
                    </div>
                 ))}
            </div>
          </div>
        )}

         {/* Placeholder text when no quiz/history is active */}
         {!displayHistory && quizQuestions.length === 0 && !isLoading && !isQuizComplete && summary && !error && (
            <p className="text-muted-foreground text-center py-4">Click "Generate Quiz" to create questions from your summary.</p>
         )}
         {!displayHistory && quizQuestions.length === 0 && !isLoading && !isQuizComplete && !summary && (
            <p className="text-muted-foreground text-center py-4">Generate a summary first to enable quiz creation.</p>
         )}

      </CardContent>
    </Card>
  );
}
