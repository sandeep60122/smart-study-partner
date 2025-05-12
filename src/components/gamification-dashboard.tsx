// src/components/gamification-dashboard.tsx
"use client";

import React from 'react';
import { useUserProfile } from '@/contexts/user-profile-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge as UiBadge } from '@/components/ui/badge'; // Renaming to avoid conflict
import * as LucideIcons from 'lucide-react'; // Import all icons
import type { Icon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

export function GamificationDashboard() {
  const { profile, isLoadingProfile } = useUserProfile();

  if (isLoadingProfile || !profile) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-6">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getLucideIcon = (iconName: string | undefined): Icon | null => {
    if (!iconName) return LucideIcons.Award; // Default icon
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.Award;
  };
  
  // Example: Calculate overall progress (can be expanded)
  // This is a placeholder, actual progress depends on defined goals
  const overallProgress = Math.min((profile.points / 500) * 100, 100); // Example: 500 points = 100%

  return (
    <Card className="w-full max-w-3xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LucideIcons.Trophy className="w-6 h-6 text-yellow-500" />
          Your Progress Dashboard
        </CardTitle>
        <CardDescription>
          Track your points, earned badges, and study achievements. Keep up the great work, {profile.username}!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Points Section */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <LucideIcons.Star className="w-5 h-5 text-yellow-400" />
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{profile.points}</p>
            <p className="text-sm text-muted-foreground mt-1">Earn points by completing tasks and quizzes.</p>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <LucideIcons.BadgeCheck className="w-5 h-5 text-green-500" />
              Earned Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.badges.length === 0 ? (
              <p className="text-muted-foreground">No badges earned yet. Keep studying to unlock them!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.badges.map((badge) => {
                  const IconComponent = getLucideIcon(badge.icon);
                  return (
                    <div key={badge.id} className="p-4 border rounded-lg bg-background/70 shadow-sm flex flex-col items-center text-center">
                      {IconComponent && <IconComponent className="w-10 h-10 mb-2 text-accent" />}
                      <h3 className="font-semibold text-base">{badge.name}</h3>
                      <p className="text-xs text-muted-foreground mb-1">{badge.description}</p>
                      <UiBadge variant="secondary" className="text-xs">
                        Achieved: {new Date(badge.achievedDate).toLocaleDateString()}
                      </UiBadge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Placeholder for Overall Progress - can be more sophisticated */}
        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <LucideIcons.TrendingUp className="w-5 h-5 text-blue-500" />
                    Overall Progress
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Progress value={overallProgress} className="w-full h-3 mb-2" />
                <p className="text-sm text-muted-foreground">
                    You are {overallProgress.toFixed(0)}% towards your next milestone (example).
                </p>
            </CardContent>
        </Card>

      </CardContent>
    </Card>
  );
}
