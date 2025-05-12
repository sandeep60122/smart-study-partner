// src/app/page.tsx
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { AuthManager } from '@/components/auth';
import { Summarizer } from '@/components/summarizer';
import { Flashcards } from '@/components/flashcards';
import { TaskManager } from '@/components/task-manager';
import { Quiz } from '@/components/quiz';
import { Explanation } from '@/components/explanation';
import { GamificationDashboard } from '@/components/gamification-dashboard'; // Import Dashboard
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Layers, ListTodo, HelpCircle, Lightbulb, LayoutDashboard } from 'lucide-react'; // Add Dashboard icon
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
  }, []);
  
  // Effect to set active tab to dashboard if user is logged in and no summary yet
  useEffect(() => {
    if (currentUser && !currentSummary && activeTab === "summarizer") {
      // If logged in, but no summary, and on summarizer, maybe default to dashboard?
      // Or, if profile is loaded and username matches, go to dashboard as first view.
      if (profile && profile.username === currentUser) {
        // setActiveTab("dashboard"); // Consider this behavior carefully
      }
    }
  }, [currentUser, currentSummary, activeTab, profile]);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute top-0 right-0 z-50 p-4 md:p-6">
        <AuthManager onAuthChange={handleAuthChange} />
      </div>

      <div className="flex flex-col items-center w-full px-4 md:px-8">
        <header className="w-full max-w-5xl text-center py-8 md:py-12">
           <h1 className="text-4xl font-bold text-primary mb-2">Smart Study Partner</h1>
           <p className="text-lg text-foreground/80">Your AI-Powered IAS Exam Preparation Assistant</p>
        </header>

        {currentUser ? (
          <main className="w-full max-w-5xl mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 mb-6"> {/* Adjusted grid columns */}
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                   <LayoutDashboard className="w-4 h-4" /> Dashboard
                </TabsTrigger>
                <TabsTrigger value="summarizer" className="flex items-center gap-2">
                   <FileText className="w-4 h-4" /> Summarizer
                </TabsTrigger>
                <TabsTrigger value="explanation" className="flex items-center gap-2" disabled={!currentSummary}>
                    <Lightbulb className="w-4 h-4" /> Explanation
                </TabsTrigger>
                <TabsTrigger value="flashcards" className="flex items-center gap-2" disabled={!currentSummary}>
                    <Layers className="w-4 h-4" /> Flashcards
                </TabsTrigger>
                 <TabsTrigger value="quiz" className="flex items-center gap-2" disabled={!currentSummary}>
                    <HelpCircle className="w-4 h-4" /> Quiz
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex items-center gap-2">
                   <ListTodo className="w-4 h-4" /> Task Manager
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <GamificationDashboard />
              </TabsContent>

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
            </Tabs>
          </main>
        ) : (
          <div className="w-full max-w-5xl mt-12 md:mt-20 text-center text-muted-foreground py-8">
            Please log in with a username to access the tools.
          </div>
        )}
      </div>
    </div>
  );
}
