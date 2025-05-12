// src/app/page.tsx
"use client";

import React, { useState, useCallback } from 'react';
import { AuthManager } from '@/components/auth';
import { Summarizer } from '@/components/summarizer';
import { Flashcards } from '@/components/flashcards';
import { TaskManager } from '@/components/task-manager';
import { Quiz } from '@/components/quiz';
import { Explanation } from '@/components/explanation'; // Import the Explanation component
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { FileText, Layers, ListTodo, HelpCircle, Lightbulb } from 'lucide-react'; // Add Lightbulb icon

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentSummary, setCurrentSummary] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("summarizer");


  const handleAuthChange = useCallback((username: string | null) => {
    setCurrentUser(username);
     if (username === null) {
        setCurrentSummary(null);
        setActiveTab("summarizer");
     }
  }, []);

  const handleSummaryGenerated = useCallback((summary: string) => {
    setCurrentSummary(summary);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">

      <div className="absolute top-0 right-0 z-50 p-4 md:p-6">
        <AuthManager onAuthChange={handleAuthChange} />
      </div>

      <div className="flex flex-col items-center w-full px-4 md:px-8">
        <header className="w-full max-w-5xl text-center py-8 md:py-12">
           <h1 className="text-4xl font-bold text-primary mb-2">Smart Study Partner</h1> {/* Updated Title */}
           <p className="text-lg text-foreground/80">Your AI-Powered IAS Exam Preparation Assistant</p>
        </header>

        {currentUser ? (
          <main className="w-full max-w-5xl mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-6"> {/* Adjusted grid columns */}
                <TabsTrigger value="summarizer" className="flex items-center gap-2">
                   <FileText className="w-4 h-4" /> Summarizer
                </TabsTrigger>
                <TabsTrigger value="explanation" className="flex items-center gap-2" disabled={!currentSummary}>
                    <Lightbulb className="w-4 h-4" /> Explanation
                </TabsTrigger>
                <TabsTrigger value="flashcards-viewer" className="flex items-center gap-2" disabled={!currentSummary}>
                    <Layers className="w-4 h-4" /> Flashcards
                </TabsTrigger>
                 <TabsTrigger value="quiz" className="flex items-center gap-2" disabled={!currentSummary}>
                    <HelpCircle className="w-4 h-4" /> Quiz
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex items-center gap-2">
                   <ListTodo className="w-4 h-4" /> Task Manager
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summarizer">
                <Summarizer onSummaryGenerated={handleSummaryGenerated} />
              </TabsContent>

              <TabsContent value="explanation">
                 <Explanation summary={currentSummary} />
              </TabsContent>

              <TabsContent value="flashcards-viewer">
                 <Flashcards summary={currentSummary} />
               </TabsContent>

               <TabsContent value="quiz">
                  <Quiz summary={currentSummary} username={currentUser} />
               </TabsContent>

              <TabsContent value="tasks">
                <TaskManager username={currentUser} />
              </TabsContent>
            </Tabs>
          </main>
        ) : (
          <div className="w-full max-w-5xl mt-12 md:mt-20 text-center text-muted-foreground py-8">
            Please log in with a username to access the tools.
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}
