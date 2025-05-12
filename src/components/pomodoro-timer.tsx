// src/components/pomodoro-timer.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

type TimerMode = 'Work' | 'ShortBreak' | 'LongBreak';
type TimerStatus = 'Running' | 'Paused' | 'Idle';

const WORK_DURATION = 25 * 60; // 25 minutes in seconds
const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
const LONG_BREAK_DURATION = 15 * 60; // 15 minutes
const SESSIONS_BEFORE_LONG_BREAK = 4;

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('Work');
  const [status, setStatus] = useState<TimerStatus>('Idle');
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
   const audioRef = useRef<HTMLAudioElement | null>(null);
   const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
     // Preload audio on client mount
     if (typeof window !== 'undefined') {
        audioRef.current = new Audio('/sounds/timer-complete.mp3'); // Ensure you have this sound file in public/sounds
        audioRef.current.preload = 'auto';
     }
  }, []);

  const getDuration = useCallback((currentMode: TimerMode): number => {
    switch (currentMode) {
      case 'Work':
        return WORK_DURATION;
      case 'ShortBreak':
        return SHORT_BREAK_DURATION;
      case 'LongBreak':
        return LONG_BREAK_DURATION;
      default:
        return WORK_DURATION;
    }
  }, []);

  const switchMode = useCallback(() => {
    let nextMode: TimerMode;
    let nextSessionsCompleted = sessionsCompleted;

    if (mode === 'Work') {
       nextSessionsCompleted += 1;
      if (nextSessionsCompleted % SESSIONS_BEFORE_LONG_BREAK === 0) {
        nextMode = 'LongBreak';
      } else {
        nextMode = 'ShortBreak';
      }
    } else {
      nextMode = 'Work'; // After any break, go back to Work
    }

    setMode(nextMode);
    setSessionsCompleted(nextSessionsCompleted);
    setTimeLeft(getDuration(nextMode));
    setStatus('Idle'); // Start next session in Idle state

     // Play sound notification
     if (audioRef.current) {
        audioRef.current.play().catch(err => console.error("Audio play failed:", err));
      }

  }, [mode, sessionsCompleted, getDuration]);

  useEffect(() => {
    if (status === 'Running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current!);
            switchMode();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, switchMode]);

  const handleStartPause = () => {
    if (status === 'Running') {
      setStatus('Paused');
    } else {
      setStatus('Running');
    }
  };

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setStatus('Idle');
    setTimeLeft(getDuration(mode)); // Reset to current mode's full duration
  };

   // Ensure time display updates correctly when switching modes while paused/idle
   useEffect(() => {
     if (status !== 'Running') {
       setTimeLeft(getDuration(mode));
     }
   }, [mode, status, getDuration]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = ((getDuration(mode) - timeLeft) / getDuration(mode)) * 100;

  const getModeStyles = () => {
     switch (mode) {
       case 'Work': return 'border-primary/50 bg-primary/5';
       case 'ShortBreak': return 'border-green-500/50 bg-green-500/5';
       case 'LongBreak': return 'border-blue-500/50 bg-blue-500/5';
       default: return 'border-muted bg-card';
     }
   };

   const getModeIcon = () => {
      switch (mode) {
          case 'Work': return <Brain className="w-5 h-5 mr-2 text-primary" />;
          case 'ShortBreak':
          case 'LongBreak': return <Coffee className="w-5 h-5 mr-2 text-green-600" />;
          default: return null;
      }
   }

   if (!isClient) {
     return <div>Loading Timer...</div>; // Or a skeleton loader
   }

  return (
     <Card className={`w-full max-w-md text-center shadow-lg ${getModeStyles()}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-xl font-semibold">
              {getModeIcon()}
              Pomodoro Timer: {mode}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="text-6xl font-bold font-mono text-foreground tabular-nums">
               {formatTime(timeLeft)}
            </div>
            <Progress value={progress} className="w-full h-3" />
            <div className="flex justify-center gap-4">
                <Button onClick={handleStartPause} size="lg" variant={status === 'Running' ? "secondary" : "default"} className="min-w-[120px]">
                {status === 'Running' ? (
                    <> <Pause className="mr-2 h-5 w-5" /> Pause </>
                ) : (
                    <> <Play className="mr-2 h-5 w-5" /> Start </>
                )}
                </Button>
                <Button onClick={handleReset} size="lg" variant="outline">
                    <RotateCcw className="mr-2 h-5 w-5" /> Reset
                </Button>
           </div>
           <p className="text-sm text-muted-foreground">
               Sessions completed: {Math.floor(sessionsCompleted / 1)} {/* Display only completed work sessions */}
           </p>
        </CardContent>
      </Card>
  );
}
