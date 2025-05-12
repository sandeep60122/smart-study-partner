// src/components/ias-prep.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, FileText, Link as LinkIcon, BookOpen, Edit3, BarChart3, Newspaper, Lightbulb, MessageSquareWarning, AlertCircle } from 'lucide-react';
import { processIasMaterial, ProcessIasMaterialOutput } from '@/ai/flows/process-ias-material'; // Import the new flow

interface ResourceLinkProps {
  href: string;
  children: React.ReactNode;
}

const ResourceLink: React.FC<ResourceLinkProps> = ({ href, children }) => (
  <Button variant="link" asChild className="p-0 h-auto justify-start text-base text-accent hover:text-accent/80">
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
      {children} <LinkIcon className="w-4 h-4" />
    </a>
  </Button>
);

export function IASPrep() {
    const [inputType, setInputType] = useState<'text' | 'url'>('text');
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ProcessIasMaterialOutput | null>(null);

    const handleProcessMaterial = async () => {
        if (!inputValue.trim()) {
          setError('Please enter text or a URL.');
          return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null); // Clear previous result

        try {
          const aiResult = await processIasMaterial({ material: inputValue });
          setResult(aiResult);
        } catch (err) {
          console.error('IAS Material processing error:', err);
          setError(err instanceof Error ? err.message : 'Failed to process material. Please check the input or try again later.');
        } finally {
          setIsLoading(false);
        }
      };


  return (
    <Card className="w-full max-w-3xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
          <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-primary" /> IAS Exam Preparation Assistant
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Process study material for IAS context, get insights, and explore different perspectives.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6">
        {/* Input Section */}
         <Card className="bg-card shadow-sm border border-border/50">
             <CardHeader>
                <CardTitle className="text-lg">Process Study Material</CardTitle>
                <CardDescription>Paste text or enter a URL to analyze it for the IAS exam.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
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
                    rows={8}
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
                <Button onClick={handleProcessMaterial} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Process Material'
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
                       <CardTitle className="text-lg">IAS Focused Summary</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <p className="whitespace-pre-wrap text-sm">{result.iasSummary}</p>
                     </CardContent>
                 </Card>

                 <Accordion type="multiple" className="w-full space-y-4">
                     <AccordionItem value="relevance" className="border rounded-lg px-4 bg-card">
                         <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                             <div className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary" /> Exam Relevance
                             </div>
                         </AccordionTrigger>
                         <AccordionContent className="space-y-3 pt-2 pl-2">
                            <h4 className="font-semibold text-base">Preliminary Exam:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
                                {result.examRelevance.prelims.map((point, index) => <li key={`prelims-${index}`}>{point}</li>)}
                            </ul>
                            <h4 className="font-semibold text-base mt-3">Main Exam:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
                                 {result.examRelevance.mains.map((point, index) => <li key={`mains-${index}`}>{point}</li>)}
                            </ul>
                         </AccordionContent>
                     </AccordionItem>

                     <AccordionItem value="insights" className="border rounded-lg px-4 bg-card">
                          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                              <div className="flex items-center gap-2">
                                 <Lightbulb className="w-5 h-5 text-primary" /> Key Insights
                              </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-3 pt-2 pl-2">
                             <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
                                 {result.keyInsights.map((insight, index) => <li key={`insight-${index}`}>{insight}</li>)}
                             </ul>
                          </AccordionContent>
                      </AccordionItem>

                     <AccordionItem value="debate" className="border rounded-lg px-4 bg-card">
                          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                              <div className="flex items-center gap-2">
                                 <MessageSquareWarning className="w-5 h-5 text-primary" /> Debate Points
                              </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2 pl-2">
                             <p className="font-semibold text-base">Debate Topic: <span className="font-normal">{result.debatePoints.topic}</span></p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                     <h5 className="font-semibold text-sm mb-1 text-green-500">Arguments For:</h5>
                                     <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground pl-4">
                                         {result.debatePoints.argumentsFor.map((arg, index) => <li key={`for-${index}`}>{arg}</li>)}
                                     </ul>
                                 </div>
                                 <div>
                                      <h5 className="font-semibold text-sm mb-1 text-red-500">Arguments Against:</h5>
                                      <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground pl-4">
                                           {result.debatePoints.argumentsAgainst.map((arg, index) => <li key={`against-${index}`}>{arg}</li>)}
                                      </ul>
                                 </div>
                             </div>
                          </AccordionContent>
                      </AccordionItem>
                 </Accordion>
            </div>
        )}


        {/* Static Resources Section (Optional) - You can keep this or remove it */}
        <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">General IAS Resources</h3>
             <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="syllabus">
                   <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                       <div className="flex items-center gap-2">
                           <BarChart3 className="w-5 h-5 text-primary" /> UPSC Syllabus Overview
                       </div>
                   </AccordionTrigger>
                   <AccordionContent className="space-y-3 pt-2 pl-2">
                     {/* ... content from previous version ... */}
                     <p className="text-base text-foreground/90">
                        Understanding the UPSC syllabus is the first crucial step. It's divided into Prelims and Mains.
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
                        <li><strong>Preliminary Exam:</strong> Two objective type papers (GS Paper I & CSAT).</li>
                        <li><strong>Main Exam:</strong> Nine descriptive papers including Essay, GS I-IV, two optional subject papers, and qualifying language papers.</li>
                      </ul>
                      <ResourceLink href="https://upsc.gov.in/examinations/civil-services-examination">
                        Official UPSC Syllabus
                      </ResourceLink>
                   </AccordionContent>
                </AccordionItem>
                <AccordionItem value="current-affairs">
                   <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                       <div className="flex items-center gap-2">
                           <Newspaper className="w-5 h-5 text-primary" /> Current Affairs Strategy
                       </div>
                   </AccordionTrigger>
                   <AccordionContent className="space-y-3 pt-2 pl-2">
                     {/* ... content from previous version ... */}
                      <p className="text-base text-foreground/90">
                        Current affairs are vital for both Prelims and Mains. Develop a habit of daily newspaper reading and supplement with monthly magazines.
                      </p>
                      <p className="text-sm text-muted-foreground pl-4">Recommended Sources:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-8">
                        <li>The Hindu / Indian Express</li>
                        <li>PIB Releases</li>
                        <li>Yojana & Kurukshetra Magazines</li>
                        <li>Reputable online current affairs portals</li>
                      </ul>
                   </AccordionContent>
                 </AccordionItem>
                 <AccordionItem value="answer-writing">
                   <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                       <div className="flex items-center gap-2">
                           <Edit3 className="w-5 h-5 text-primary" /> Answer Writing Practice
                       </div>
                   </AccordionTrigger>
                   <AccordionContent className="space-y-3 pt-2 pl-2">
                     {/* ... content from previous version ... */}
                      <p className="text-base text-foreground/90">
                        Mains exam success heavily depends on your answer writing skills. Focus on structure, clarity, and addressing all parts of the question.
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
                        <li>Start with previous year questions.</li>
                        <li>Practice writing answers within time limits.</li>
                        <li>Incorporate diagrams, flowcharts, and maps where relevant.</li>
                        <li>Seek feedback on your answers.</li>
                      </ul>
                      <p className="text-muted-foreground text-sm pl-4">
                        Use the summarization and analysis tools above to break down complex topics, which can then be used as a base for your answers.
                      </p>
                   </AccordionContent>
                 </AccordionItem>
                 {/* Optional Subject Item can be added back if needed */}
             </Accordion>
        </div>


      </CardContent>
    </Card>
  );
}
