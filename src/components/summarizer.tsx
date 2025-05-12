// src/components/summarizer.tsx
"use client";

import React, { useState } from 'react';
import { summarizeStudyMaterial } from '@/ai/flows/summarize-study-material';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, FileText, Link as LinkIcon, AlertCircle } from 'lucide-react';

interface SummarizerProps {
  onSummaryGenerated: (summary: string) => void;
}

export function Summarizer({ onSummaryGenerated }: SummarizerProps) {
  const [inputType, setInputType] = useState<'text' | 'url'>('text');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!inputValue.trim()) {
      setError('Please enter text or a URL.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSummary(null); // Clear previous summary

    try {
      const result = await summarizeStudyMaterial({ material: inputValue });
      setSummary(result.summary);
      onSummaryGenerated(result.summary); // Pass summary to parent
    } catch (err) {
      console.error('Summarization error:', err);
      setError('Failed to generate summary. Please check the input or try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-6 h-6" /> AI Summarizer
        </CardTitle>
        <CardDescription>
          Paste text or enter a URL to generate a concise summary of your study material.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2 mb-4">
           <Button
             variant={inputType === 'text' ? 'default': 'outline'}
             onClick={() => setInputType('text')}
             className="flex-1"
           >
             <FileText className="mr-2 h-4 w-4"/> Paste Text
           </Button>
            <Button
             variant={inputType === 'url' ? 'default': 'outline'}
             onClick={() => setInputType('url')}
             className="flex-1"
           >
              <LinkIcon className="mr-2 h-4 w-4"/> Enter URL
           </Button>
        </div>

        {inputType === 'text' ? (
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Paste your study material here..."
            rows={10}
            className="resize-y"
            aria-label="Study material text input"
          />
        ) : (
          <Input
            type="url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="https://example.com/article"
            aria-label="Study material URL input"
          />
        )}

        {error && (
          <Alert variant="destructive">
             <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
       <CardFooter className="flex justify-end">
        <Button onClick={handleSummarize} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Summarizing...
            </>
          ) : (
            'Generate Summary'
          )}
        </Button>
      </CardFooter>

       {summary && !isLoading && (
          <Card className="mt-6 mx-6 mb-6 bg-secondary/50">
             <CardHeader>
               <CardTitle>Generated Summary</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="whitespace-pre-wrap text-sm">{summary}</p>
             </CardContent>
           </Card>
       )}
    </Card>
  );
}
