// src/lib/badge-definitions.ts
import type { UserProfileData, Task, QuizResult, Badge, StudySession } from './types';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  criteria: (profile: UserProfileData, context?: any) => boolean; // context can be { tasks?: Task[], quizResult?: QuizResult, studySessions?: StudySession[], newSession?: StudySession }
  pointsAwarded?: number; // Optional points awarded with the badge
}

export const badgeDefinitions: Record<string, BadgeDefinition> = {
  FIRST_TASK_COMPLETED: {
    id: 'first-task-completed',
    name: 'Task Initiator',
    description: 'Completed your very first task!',
    icon: 'CheckSquare',
    criteria: (profile, context?: { tasks: Task[] }) => {
      return context?.tasks?.filter(t => t.completed).length === 1;
    },
    pointsAwarded: 5,
  },
  FIVE_TASKS_COMPLETED: {
    id: 'five-tasks-completed',
    name: 'Task Doer',
    description: 'Completed 5 tasks!',
    icon: 'ListChecks',
    criteria: (profile, context?: { tasks: Task[] }) => {
      return context?.tasks?.filter(t => t.completed).length >= 5; // Changed to >=
    },
    pointsAwarded: 20,
  },
  PERFECT_QUIZ_SCORE: {
    id: 'perfect-quiz-score',
    name: 'Quiz Whiz',
    description: 'Achieved a perfect score on a quiz!',
    icon: 'Award',
    criteria: (profile, context?: { quizResult: QuizResult }) => {
      return context?.quizResult?.percentage === 100;
    },
    pointsAwarded: 25,
  },
  STREAK_STARTER: {
    id: 'streak-starter',
    name: 'Streak Starter',
    description: 'Completed tasks on 3 different days!',
    icon: 'Flame',
    criteria: (profile, context?: { tasks: Task[] }) => {
      if (!context?.tasks) return false;
      const completedDates = new Set(
        context.tasks
          .filter(t => t.completed && t.completionDate)
          .map(t => new Date(t.completionDate!).toDateString())
      );
      return completedDates.size >= 3;
    },
    pointsAwarded: 30,
  },
  FIRST_SESSION_LOGGED: {
    id: 'first-session-logged',
    name: 'Focus Starter',
    description: 'Logged your first study session!',
    icon: 'PlayCircle',
    criteria: (profile, context?: { studySessions: StudySession[] }) => {
      return context?.studySessions?.length === 1;
    },
    pointsAwarded: 10,
  },
  STUDY_HOUR_ACHIEVED: {
    id: 'study-hour-achieved',
    name: 'Hour Hero',
    description: 'Logged over 1 hour of total study time!',
    icon: 'Clock',
    criteria: (profile, context?: { studySessions: StudySession[] }) => {
      if (!context?.studySessions) return false;
      const totalDurationSeconds = context.studySessions.reduce((sum, s) => {
        return sum + (s.endTime - s.startTime) / 1000;
      }, 0);
      return totalDurationSeconds >= 3600; // 1 hour = 3600 seconds
    },
    pointsAwarded: 20,
  },
  // Add more badges here
};

export function awardBadgeIfCriteriaMet(
  profile: UserProfileData,
  badgeId: keyof typeof badgeDefinitions,
  context?: any // context can now be { tasks?: Task[], quizResult?: QuizResult, studySessions?: StudySession[] }
): { updatedProfile: UserProfileData; newBadgeAwarded: Badge | null } {
  const definition = badgeDefinitions[badgeId];
  if (!definition) return { updatedProfile: profile, newBadgeAwarded: null };

  const alreadyHasBadge = profile.badges.some(b => b.id === definition.id);
  if (alreadyHasBadge) return { updatedProfile: profile, newBadgeAwarded: null };

  if (definition.criteria(profile, context)) {
    const newBadge: Badge = {
      id: definition.id,
      name: definition.name,
      description: definition.description,
      icon: definition.icon,
      achievedDate: Date.now(),
    };
    let updatedPoints = profile.points;
    if (definition.pointsAwarded) {
      updatedPoints += definition.pointsAwarded;
    }
    const updatedProfile = {
      ...profile,
      points: updatedPoints,
      badges: [...profile.badges, newBadge],
    };
    return { updatedProfile, newBadgeAwarded: newBadge };
  }

  return { updatedProfile: profile, newBadgeAwarded: null };
}
