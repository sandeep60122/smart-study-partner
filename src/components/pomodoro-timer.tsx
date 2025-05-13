// src/components/pomodoro-timer.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, TimerIcon } from 'lucide-react';

type TimerStatus = 'Running' | 'Paused' | 'Idle';

interface PomodoroTimerProps {
  onTimeUpdate?: (elapsedTimeInSeconds: number) => void;
  initialElapsedTime?: number; // To resume from a certain point if needed
}

export function PomodoroTimer({ onTimeUpdate, initialElapsedTime = 0 }: PomodoroTimerProps) {
  const [status, setStatus] = useState<TimerStatus>('Idle');
  const [elapsedTime, setElapsedTime] = useState(initialElapsedTime); // in seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null); // For potential future sounds
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Optional: Preload audio if you plan to add sounds
    // if (typeof window !== 'undefined') {
    //    audioRef.current = new Audio('/sounds/timer-tick.mp3'); 
    //    audioRef.current.preload = 'auto';
    // }
  }, []);

  useEffect(() => {
    if (status === 'Running') {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prevTime) => {
          const newTime = prevTime + 1;
          if (onTimeUpdate) {
            onTimeUpdate(newTime);
          }
          return newTime;
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
  }, [status, onTimeUpdate]);

  const handleStartPause = () => {
    if (status === 'Running') {
      setStatus('Paused');
    } else {
      setStatus('Running');
      // If starting from idle and there's an onTimeUpdate, ensure initial time is reported
      if (status === 'Idle' && onTimeUpdate) {
        onTimeUpdate(elapsedTime);
      }
    }
  };

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setStatus('Idle');
    setElapsedTime(0);
    if (onTimeUpdate) {
      onTimeUpdate(0);
    }
    // Optional: play reset sound
    // if (audioRef.current) audioRef.current.play().catch(console.error);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let timeString = '';
    if (hours > 0) {
        timeString += `${String(hours).padStart(2, '0')}:`;
    }
    timeString += `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return timeString;
  };
  
  if (!isClient) {
    return <Card className="w-full max-w-sm sm:max-w-md text-center shadow-lg p-2 sm:p-0"><CardHeader className="p-2 sm:p-6"><CardTitle>Loading Timer...</CardTitle></CardHeader></Card>;
  }

  return (
     <Card className={`w-full max-w-xs sm:max-w-sm text-center shadow-lg border-primary/30 bg-card p-2 sm:p-0`}>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center justify-center text-lg sm:text-xl font-semibold">
              <TimerIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-primary" />
              Study Session Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6 pt-0">
            <div className="text-4xl sm:text-5xl font-bold font-mono text-foreground tabular-nums">
               {formatTime(elapsedTime)}
            </div>
            {/* No progress bar for stopwatch */}
            <div className="flex justify-center gap-2 sm:gap-4">
                <Button onClick={handleStartPause} size="lg" variant={status === 'Running' ? "secondary" : "default"} className="min-w-[90px] sm:min-w-[120px]">
                {status === 'Running' ? (
                    <> <Pause className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Pause </>
                ) : (
                    <> <Play className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Start </>
                )}
                </Button>
                <Button onClick={handleReset} size="lg" variant="outline">
                    <RotateCcw className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:h-5" /> Reset
                </Button>
           </div>
           {/* Session count removed, as it's managed by TaskManager */}
        </CardContent>
      </Card>
  );
}
