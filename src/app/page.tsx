// src/app/page.tsx
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { AuthManager } from '@/components/auth';
import { Summarizer } from '@/components/summarizer';
import { Flashcards } from '@/components/flashcards';
import { TaskManager } from '@/components/task-manager';
import { Quiz } from '@/components/quiz';
import { Explanation } from '@/components/explanation';
import { IASPrep } from '@/components/ias-prep'; // Ensure correct import path
import { AptitudeSolver } from '@/components/aptitude-solver'; // Import the new Aptitude component
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Layers, ListTodo, HelpCircle, Lightbulb, BookOpen, Calculator } from 'lucide-react'; // Added Calculator icon
import { useUserProfile } from '@/contexts/user-profile-context';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentSummary, setCurrentSummary] = useState<string | null>(null);
  const [currentSummaryHash, setCurrentSummaryHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("summarizer");
  const { loadProfile, clearProfile, profile } = useUserProfile();


  const handleAuthChange = useCallback((username: string | null) => {
    setCurrentUser(username);
    if (username) {
      loadProfile(username);
    } else {
      clearProfile();
      setCurrentSummary(null);
      setCurrentSummaryHash(null);
      setActiveTab("summarizer"); // Reset to summarizer if logged out
    }
  }, [loadProfile, clearProfile]);

  const generateSummaryHash = (s: string | null): string | null => {
     if (!s) return null;
     let hash = 0;
     for (let i = 0; i < s.length; i++) {
       const char = s.charCodeAt(i);
       hash = (hash << 5) - hash + char;
       hash |= 0; // Convert to 32bit integer
     }
     return hash.toString();
   };

  const handleSummaryGenerated = useCallback((summary: string) => {
    setCurrentSummary(summary);
    setCurrentSummaryHash(generateSummaryHash(summary));
    // Optionally switch to explanation or flashcards tab after summary generation
    // setActiveTab("explanation");
  }, []);

  useEffect(() => {
    // Pre-load or initial setup logic if needed based on user or profile
  }, [currentUser, profile]);

   // When summary changes, make Explanation, Flashcards, Quiz tabs available
   useEffect(() => {
    if (currentSummary && (activeTab === 'explanation' || activeTab === 'flashcards' || activeTab === 'quiz')) {
        // User is on a tab that requires a summary, and one exists. Good.
    } else if (!currentSummary && (activeTab === 'explanation' || activeTab === 'flashcards' || activeTab === 'quiz')) {
        // If summary is cleared (e.g., new user logs in), switch away from summary-dependent tabs
        setActiveTab("summarizer");
    }
   }, [currentSummary, activeTab]);


  return (
    <div className="min-h-screen bg-background relative">
      {/* Adjust padding for AuthManager based on screen size */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 p-1 sm:p-2">
        <AuthManager onAuthChange={handleAuthChange} />
      </div>

      {/* Adjust padding for mobile */}
      <div className="flex flex-col items-center w-full px-4 sm:px-6 lg:px-8">
        <header className="w-full max-w-5xl text-center py-8 md:py-12">
           <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Smart Study Partner</h1>
           <p className="text-base sm:text-lg text-foreground/80">Your AI-Powered Assistant - Created by Sandeep</p>
        </header>

        {currentUser ? (
          <main className="w-full max-w-5xl mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Responsive grid columns for tabs */}
              {/* Increased grid columns to accommodate the new tab */}
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-7 mb-6">
                <TabsTrigger value="summarizer" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
                   <FileText className="w-4 h-4" /> <span className="truncate">Summarizer</span>
                </TabsTrigger>
                <TabsTrigger value="explanation" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm" disabled={!currentSummary}>
                    <Lightbulb className="w-4 h-4" /> <span className="truncate">Explanation</span>
                </TabsTrigger>
                <TabsTrigger value="flashcards" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm" disabled={!currentSummary}>
                    <Layers className="w-4 h-4" /> <span className="truncate">Flashcards</span>
                </TabsTrigger>
                 <TabsTrigger value="quiz" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm" disabled={!currentSummary}>
                    <HelpCircle className="w-4 h-4" /> <span className="truncate">Quiz</span>
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
                   <ListTodo className="w-4 h-4" /> <span className="truncate">Tasks</span>
                </TabsTrigger>
                <TabsTrigger value="ias-prep" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
                   <BookOpen className="w-4 h-4" /> <span className="truncate">IAS Prep</span>
                </TabsTrigger>
                 <TabsTrigger value="aptitude" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Calculator className="w-4 h-4" /> <span className="truncate">Aptitude</span>
                 </TabsTrigger>
              </TabsList>

              <TabsContent value="summarizer">
                <Summarizer onSummaryGenerated={handleSummaryGenerated} />
              </TabsContent>

              <TabsContent value="explanation">
                 <Explanation summary={currentSummary} />
              </TabsContent>

              <TabsContent value="flashcards">
                 <Flashcards summary={currentSummary} summaryHash={currentSummaryHash} username={currentUser} />
               </TabsContent>

               <TabsContent value="quiz">
                  <Quiz summary={currentSummary} username={currentUser} summaryHash={currentSummaryHash} />
               </TabsContent>

              <TabsContent value="tasks">
                <TaskManager username={currentUser} />
              </TabsContent>

              <TabsContent value="ias-prep">
                <IASPrep />
              </TabsContent>

               <TabsContent value="aptitude">
                 <AptitudeSolver />
               </TabsContent>
            </Tabs>
          </main>
        ) : (
          <div className="w-full max-w-5xl mt-12 md:mt-20 text-center text-muted-foreground py-8 px-4">
            Please log in with a username to access the tools.
          </div>
        )}
      </div>
    </div>
  );
}
