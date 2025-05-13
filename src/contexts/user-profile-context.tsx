// src/contexts/user-profile-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { UserProfileData, Badge, Task, QuizResult, StudySession } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';
import { badgeDefinitions, awardBadgeIfCriteriaMet } from '@/lib/badge-definitions';
import type { BadgeDefinition } from '@/lib/badge-definitions';
import { useToast } from '@/hooks/use-toast';

interface UserProfileContextType {
  profile: UserProfileData | null;
  isLoadingProfile: boolean;
  loadProfile: (username: string) => void;
  clearProfile: () => void;
  addPoints: (amount: number) => void;
  checkAndAwardBadgesForTaskCompletion: (tasks: Task[]) => void;
  checkAndAwardBadgesForQuizCompletion: (quizResult: QuizResult) => void;
  checkAndAwardBadgesForStudySession: (studySessions: StudySession[]) => void; // New
  updateUserProfile: (updatedProfile: UserProfileData) => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

const INITIAL_PROFILE_STATE: UserProfileData = {
  username: '',
  points: 0,
  badges: [],
};

export const UserProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const storageKey = currentUsername ? `ias-catalyst-profile-${currentUsername}` : null;
  
  const [profile, setProfile] = useLocalStorage<UserProfileData>(storageKey || '_disabled_profile', INITIAL_PROFILE_STATE);
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const { toast } = useToast();

  const loadProfile = useCallback((username: string) => {
    setIsLoadingProfile(true);
    setCurrentUsername(username);
  }, []);
  
  useEffect(() => {
    if (storageKey && profile && profile.username !== currentUsername) {
      if (profile.username === '' && currentUsername) { 
         setProfile(prev => ({ ...prev, username: currentUsername }));
      } else if (currentUsername) { 
         const storedItem = localStorage.getItem(storageKey);
         if (!storedItem) { 
            setProfile({ username: currentUsername, points: 0, badges: [] });
         }
      }
    }
    if (currentUsername) setIsLoadingProfile(false);
  }, [profile, currentUsername, storageKey, setProfile]);


  const clearProfile = useCallback(() => {
    setCurrentUsername(null);
    setProfile(INITIAL_PROFILE_STATE); 
    setIsLoadingProfile(true);
  }, [setProfile]);

  const addPoints = useCallback((amount: number) => {
    if (!storageKey || !profile) return; // Ensure profile is not null
    setProfile(prev => ({ ...prev!, points: prev!.points + amount }));
    toast({ title: "Points Earned!", description: `You earned ${amount} points.` });
  }, [setProfile, storageKey, toast, profile]);

  const updateUserProfile = useCallback((updatedProfile: UserProfileData) => {
    if (!storageKey) return;
    setProfile(updatedProfile);
  }, [setProfile, storageKey]);

  const checkAndAwardBadges = useCallback((
    profileToCheck: UserProfileData,
    definitionsToConsider: Record<string, BadgeDefinition>,
    context: any
  ): UserProfileData => {
    if (!storageKey || !profileToCheck) return profileToCheck;

    let updatedProfile = { ...profileToCheck };
    let newBadgeAwardedThisCall = false;

    Object.keys(definitionsToConsider).forEach(badgeId => {
      const result = awardBadgeIfCriteriaMet(updatedProfile, badgeId as keyof typeof badgeDefinitions, context);
      if (result.newBadgeAwarded) {
        updatedProfile = result.updatedProfile;
        toast({
          title: "Badge Unlocked!",
          description: `You earned the "${result.newBadgeAwarded.name}" badge!`,
        });
        newBadgeAwardedThisCall = true;
      }
    });
    
    if (newBadgeAwardedThisCall) {
       setProfile(updatedProfile);
    }
    return updatedProfile;
  }, [setProfile, storageKey, toast]);


  const checkAndAwardBadgesForTaskCompletion = useCallback((tasks: Task[]) => {
     if (!profile || !storageKey) return;
     const taskBadges = Object.entries(badgeDefinitions)
       .filter(([_, def]) => def.id.startsWith('task') || def.id.startsWith('streak')) // Include task and streak related
       .reduce((obj, [key, val]) => { obj[key] = val; return obj; }, {} as Record<string, BadgeDefinition>);
     
     setProfile(currentProfile => checkAndAwardBadges(currentProfile!, taskBadges, { tasks }));
  }, [profile, storageKey, checkAndAwardBadges, setProfile]);

  const checkAndAwardBadgesForQuizCompletion = useCallback((quizResult: QuizResult) => {
    if (!profile || !storageKey) return;
    const quizBadges = Object.entries(badgeDefinitions)
      .filter(([_, def]) => def.id.startsWith('quiz'))
      .reduce((obj, [key, val]) => { obj[key] = val; return obj; }, {} as Record<string, BadgeDefinition>);
      
    setProfile(currentProfile => checkAndAwardBadges(currentProfile!, quizBadges, { quizResult }));
  }, [profile, storageKey, checkAndAwardBadges, setProfile]);

  const checkAndAwardBadgesForStudySession = useCallback((studySessions: StudySession[]) => {
    if (!profile || !storageKey) return;
    const sessionBadges = Object.entries(badgeDefinitions)
      .filter(([_, def]) => def.id.startsWith('first-session') || def.id.startsWith('study-hour')) // Example prefixes
      .reduce((obj, [key, val]) => { obj[key] = val; return obj; }, {} as Record<string, BadgeDefinition>);
    
    setProfile(currentProfile => checkAndAwardBadges(currentProfile!, sessionBadges, { studySessions }));
  }, [profile, storageKey, checkAndAwardBadges, setProfile]);


  return (
    <UserProfileContext.Provider value={{ 
      profile: storageKey && profile ? profile : null, 
      isLoadingProfile, 
      loadProfile, 
      clearProfile, 
      addPoints, 
      checkAndAwardBadgesForTaskCompletion,
      checkAndAwardBadgesForQuizCompletion,
      checkAndAwardBadgesForStudySession, // Add new function to context
      updateUserProfile
    }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};
