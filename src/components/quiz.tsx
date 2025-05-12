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
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from '@/contexts/user-profile-context'; // Import UserProfile context

interface QuizProps {
  summary: string | null;
  username: string | null;
  summaryHash: string | null; // For associating results with a summary
}

const EMPTY_QUIZ_RESULTS: QuizResult[] = [];

export function Quiz({ summary, username, summaryHash }: QuizProps) {
  const storageKey = username ? `ias-catalyst-quiz-results-${username}` : null;
  const [quizResults, setQuizResults] = useLocalStorage<QuizResult[]>(storageKey || '_disabled_quiz_results', EMPTY_QUIZ_RESULTS);
  const [isClient, setIsClient] = useState(false);

  const [quizTitle, setQuizTitle] = useState<string>('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const { toast } = useToast();
  const { addPoints, checkAndAwardBadgesForQuizCompletion, profile } = useUserProfile(); // Use profile context

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && quizResults.length > 0 && !showHistory) {
      // setShowHistory(true); // Default to history if results exist - This was the user request
    }
  }, [isClient, quizResults, showHistory]);


  const handleGenerateQuiz = async () => {
    if (!summary) {
      setError('Please generate a summary first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    resetQuizState(false); // Keep history view as is

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
      toast({ title: "Quiz Generation Failed", description: "Could not generate quiz.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuizState = (shouldHideHistory = true) => {
     setQuizTitle('');
     setQuizQuestions([]);
     setCurrentQuestionIndex(0);
     setUserAnswers([]);
     setIsQuizComplete(false);
     setScore(0);
     setError(null);
     if (shouldHideHistory) {
        setShowHistory(false);
     }
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
    
    // Award points: 1 point per correct answer
    addPoints(finalScore);


    if (storageKey) {
       const newResult: QuizResult = {
         id: `${summaryHash || 'general'}-${Date.now()}`,
         quizTitle: quizTitle || 'Untitled Quiz',
         summaryHash: summaryHash || undefined,
         score: finalScore,
         totalQuestions: totalQuestions,
         percentage: percentage,
         userAnswers: userAnswers,
         timestamp: Date.now(),
       };
       setQuizResults(prevResults => [newResult, ...prevResults].slice(0, 20));
       toast({ title: "Quiz Completed!", description: `You scored ${finalScore}/${totalQuestions} (${percentage}%). Result saved.` });
       checkAndAwardBadgesForQuizCompletion(newResult); // Check for badges
    } else {
       toast({ title: "Quiz Completed", description: `You scored ${finalScore}/${totalQuestions} (${percentage}%). Log in to save results.`, variant: "default" });
    }
  };

  const handleRetakeQuiz = () => {
     setCurrentQuestionIndex(0);
     setUserAnswers(new Array(quizQuestions.length).fill(null));
     setIsQuizComplete(false);
     setScore(0);
     setError(null);
     setShowHistory(false);
  }

  const handleToggleHistory = () => {
     setShowHistory(!showHistory);
  }

  useEffect(() => {
      resetQuizState(!showHistory); // Reset if summary changes, keep history view if it's already active
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]);


  const currentQuestion = quizQuestions[currentQuestionIndex];
  const canGenerate = !!summary && !isLoading;
  const canSubmit = userAnswers[currentQuestionIndex] !== null;
  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleString();
  const displayHistory = showHistory && isClient;

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6" /> Quiz Time!
            </CardTitle>
            {(quizResults.length > 0 || showHistory) && isClient && (
                <Button variant="outline" size="sm" onClick={handleToggleHistory}>
                    <History className="w-4 h-4 mr-2" />
                    {showHistory ? 'Take/Generate Quiz' : 'View History'}
                </Button>
            )}
        </div>
        <CardDescription>
           {displayHistory
            ? `Viewing past quiz results for ${profile?.username || 'current user'}.`
            : quizTitle && quizQuestions.length > 0 && !isQuizComplete
              ? `Quiz: ${quizTitle}`
              : 'Generate a quiz from your summary or view history.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!displayHistory && (
          <Button onClick={handleGenerateQuiz} disabled={!canGenerate || isLoading} className="w-full">
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Quiz...</> : 'Generate Quiz'}
          </Button>
        )}

        {error && !isLoading && !displayHistory && (
          <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
        )}

        {displayHistory && (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                 <h3 className="text-lg font-semibold border-b pb-2">Quiz History</h3>
                 {quizResults.length === 0 ? (
                     <p className="text-muted-foreground text-center">No quiz results found.</p>
                 ) : (
                     quizResults.map((result) => (
                         <Card key={result.id} className="bg-muted/50 p-4">
                             <p className="font-medium">{result.quizTitle}</p>
                             <p className="text-sm text-muted-foreground">Taken: {formatDate(result.timestamp)}</p>
                             <p className="text-sm">Score: {result.score}/{result.totalQuestions} ({result.percentage}%)</p>
                         </Card>
                     ))
                 )}
            </div>
        )}

        {!displayHistory && quizQuestions.length > 0 && !isQuizComplete && currentQuestion && !isLoading && (
          <div className="space-y-4">
            <Progress value={((currentQuestionIndex + 1) / quizQuestions.length) * 100} className="w-full h-2" />
            <p className="text-sm text-muted-foreground text-center">Question {currentQuestionIndex + 1} of {quizQuestions.length}</p>
            <Card className="p-4 bg-card">
                <p className="font-semibold text-lg mb-4">{currentQuestion.question}</p>
                <RadioGroup value={userAnswers[currentQuestionIndex] ?? undefined} onValueChange={handleAnswerSelect} className="space-y-2">
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

        {!displayHistory && isQuizComplete && (
          <div className="text-center space-y-4 p-6 bg-secondary/50 rounded-lg">
            <h2 className="text-2xl font-bold">Quiz Complete!</h2>
            <p className="text-xl">Your Score: <span className="font-bold text-primary">{score}</span> out of {quizQuestions.length}</p>
            <p className="text-3xl font-bold text-accent">{((score / quizQuestions.length) * 100).toFixed(0)}%</p>
            <div className="flex justify-center gap-4 pt-4">
                <Button onClick={handleRetakeQuiz} variant="outline"><RotateCcw className="mr-2 h-4 w-4" /> Retake Quiz</Button>
                <Button onClick={handleGenerateQuiz} disabled={!canGenerate || isLoading}>{isLoading ? 'Generating...' : 'Generate New Quiz'}</Button>
             </div>
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
