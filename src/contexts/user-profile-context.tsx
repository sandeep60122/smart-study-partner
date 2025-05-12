// src/contexts/user-profile-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { UserProfileData, Badge, Task, QuizResult } from '@/lib/types';
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
  
  // This local storage hook will only be active when storageKey is not null
  const [profile, setProfile] = useLocalStorage<UserProfileData>(storageKey || '_disabled_profile', INITIAL_PROFILE_STATE);
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const { toast } = useToast();

  const loadProfile = useCallback((username: string) => {
    setIsLoadingProfile(true);
    setCurrentUsername(username);
    // The useLocalStorage hook will automatically update `profile` when `storageKey` changes.
    // We need to ensure that if a new user logs in, their data is fetched/initialized.
    // If it's a new user and no data exists, useLocalStorage will return INITIAL_PROFILE_STATE.
    // We might need to explicitly set the username in the profile if it's new.
  }, [setProfile]);
  
  // Effect to set username in profile when it's loaded or key changes
  useEffect(() => {
    if (storageKey && profile && profile.username !== currentUsername) {
      // If profile loaded from storage doesn't match current user (e.g. new user, or key changed)
      // or if it's the initial state for a new user.
      if (profile.username === '' && currentUsername) { // INITIAL_PROFILE_STATE case
         setProfile(prev => ({ ...prev, username: currentUsername }));
      } else if (currentUsername) { // Existing user, ensure username is synced
         // This case might happen if storageKey changed and `useLocalStorage` picked up old data before updating profile
         // For a new user, useLocalStorage returns initialValue. If the key is valid (username set),
         // we set the username on this initial object.
         const storedItem = localStorage.getItem(storageKey);
         if (!storedItem) { // Truly a new user for this key
            setProfile({ username: currentUsername, points: 0, badges: [] });
         }
      }
    }
    if (currentUsername) setIsLoadingProfile(false);
  }, [profile, currentUsername, storageKey, setProfile]);


  const clearProfile = useCallback(() => {
    setCurrentUsername(null);
    setProfile(INITIAL_PROFILE_STATE); // Reset to initial state
    setIsLoadingProfile(true);
  }, [setProfile]);

  const addPoints = useCallback((amount: number) => {
    if (!storageKey) return;
    setProfile(prev => ({ ...prev, points: prev.points + amount }));
    toast({ title: "Points Earned!", description: `You earned ${amount} points.` });
  }, [setProfile, storageKey, toast]);

  const updateUserProfile = useCallback((updatedProfile: UserProfileData) => {
    if (!storageKey) return;
    setProfile(updatedProfile);
  }, [setProfile, storageKey]);

  const checkAndAwardBadges = useCallback((
    profileToCheck: UserProfileData,
    definitionsToConsider: Record<string, BadgeDefinition>,
    context: any
  ): UserProfileData => {
    if (!storageKey) return profileToCheck;

    let updatedProfile = { ...profileToCheck };
    let newBadgeAwardedThisCall = false;

    Object.keys(definitionsToConsider).forEach(badgeId => {
      const result = awardBadgeIfCriteriaMet(updatedProfile, badgeId, context);
      if (result.newBadgeAwarded) {
        updatedProfile = result.updatedProfile;
        toast({
          title: "Badge Unlocked!",
          description: `You earned the "${result.newBadgeAwarded.name}" badge!`,
        });
        // If badge has points, they are already added by awardBadgeIfCriteriaMet
        newBadgeAwardedThisCall = true;
      }
    });
    
    // If any badge was awarded, set the profile
    if (newBadgeAwardedThisCall) {
       setProfile(updatedProfile);
    }
    return updatedProfile; // Return potentially updated profile
  }, [setProfile, storageKey, toast]);


  const checkAndAwardBadgesForTaskCompletion = useCallback((tasks: Task[]) => {
     if (!profile || !storageKey) return;
     const taskBadges = Object.entries(badgeDefinitions)
       .filter(([_, def]) => def.id.includes('task'))
       .reduce((obj, [key, val]) => { obj[key] = val; return obj; }, {} as Record<string, BadgeDefinition>);
     
     setProfile(currentProfile => checkAndAwardBadges(currentProfile, taskBadges, { tasks }));
  }, [profile, storageKey, checkAndAwardBadges, setProfile]);

  const checkAndAwardBadgesForQuizCompletion = useCallback((quizResult: QuizResult) => {
    if (!profile || !storageKey) return;
    const quizBadges = Object.entries(badgeDefinitions)
      .filter(([_, def]) => def.id.includes('quiz'))
      .reduce((obj, [key, val]) => { obj[key] = val; return obj; }, {} as Record<string, BadgeDefinition>);
      
    setProfile(currentProfile => checkAndAwardBadges(currentProfile, quizBadges, { quizResult }));
  }, [profile, storageKey, checkAndAwardBadges, setProfile]);


  return (
    <UserProfileContext.Provider value={{ 
      profile: storageKey ? profile : null, // Only return profile if storageKey is active
      isLoadingProfile, 
      loadProfile, 
      clearProfile, 
      addPoints, 
      checkAndAwardBadgesForTaskCompletion,
      checkAndAwardBadgesForQuizCompletion,
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
