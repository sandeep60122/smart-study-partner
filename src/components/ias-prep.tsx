// src/components/ias-prep.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, Link as LinkIcon, Edit3, BarChart3, Newspaper } from 'lucide-react';

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
  return (
    <Card className="w-full max-w-3xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
          <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-primary" /> IAS Exam Preparation Resources
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Curated resources and tools to aid your IAS exam preparation journey.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="syllabus">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" /> UPSC Syllabus Overview
                </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2 pl-2">
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
                Use the "Summarizer" and "Explanation" tools to break down complex topics, which can then be used as a base for your answers.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="optional-subject">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                    Optional Subject Selection
                </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2 pl-2">
              <p className="text-base text-foreground/90">
                Choosing the right optional subject is crucial. Consider your interest, background, availability of study material, and scoring trends.
              </p>
               <p className="text-sm text-muted-foreground pl-4">
                 Popular optional subjects include Public Administration, Sociology, Geography, History, and Political Science.
               </p>
              <ResourceLink href="https://byjus.com/free-ias-prep/upsc-optional-subjects/">
                Guide to Choosing Optional Subjects
              </ResourceLink>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-8 p-4 bg-secondary/30 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">Need AI Assistance?</h3>
            <p className="text-sm text-muted-foreground mb-3">
                Use the <strong>Summarizer</strong> to break down complex articles, generate <strong>Flashcards</strong> for key terms, or take a <strong>Quiz</strong> to test your understanding.
            </p>
            <p className="text-sm text-muted-foreground">
                The <strong>Task Manager</strong> can help you schedule your study plan effectively.
            </p>
        </div>

      </CardContent>
    </Card>
  );
}
