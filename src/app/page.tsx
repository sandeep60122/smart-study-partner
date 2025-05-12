// src/app/page.tsx
"use client";

import React, { useState, useCallback } from 'react';
import { AuthManager } from '@/components/auth';
import { Summarizer } from '@/components/summarizer';
import { Flashcards } from '@/components/flashcards';
import { TaskManager } from '@/components/task-manager';
import { Quiz } from '@/components/quiz'; // Import the Quiz component
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { FileText, Layers, ListTodo, HelpCircle } from 'lucide-react'; // Add HelpCircle icon

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentSummary, setCurrentSummary] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("summarizer"); // Keep track of active tab


  const handleAuthChange = useCallback((username: string | null) => {
    setCurrentUser(username);
     // Reset summary when user logs out/changes
     if (username === null) {
        setCurrentSummary(null);
        setActiveTab("summarizer"); // Reset to summarizer tab on logout
     }
  }, []);

  const handleSummaryGenerated = useCallback((summary: string) => {
    setCurrentSummary(summary);
     // Optionally switch to flashcards or quiz tab after summary generation
     // setActiveTab("flashcards-viewer");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background">
      <header className="w-full max-w-5xl mb-8 text-center">
         <h1 className="text-4xl font-bold text-primary mb-2">IAS Catalyst</h1>
         <p className="text-lg text-foreground/80">Your AI-Powered IAS Exam Preparation Assistant</p>
      </header>

      <AuthManager onAuthChange={handleAuthChange} />

      {currentUser ? (
        <main className="w-full max-w-5xl mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
             {/* Updated grid-cols-4 */}
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="summarizer" className="flex items-center gap-2">
                 <FileText className="w-4 h-4" /> Summarizer
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
        <div className="mt-8 text-center text-muted-foreground">
          Please log in with a username to access the tools.
        </div>
      )}
      <Toaster />
    </div>
  );
}
