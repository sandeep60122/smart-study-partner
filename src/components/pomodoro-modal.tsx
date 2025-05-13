// src/components/pomodoro-modal.tsx
"use client";

import React, { useState, useCallback } from 'react'; // Import useCallback
import type { Task } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PomodoroTimer } from '@/components/pomodoro-timer'; 
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Save, XCircle } from 'lucide-react';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onSessionLogged: (durationInSeconds: number) => void; // Callback to log the session
}

export function PomodoroModal({ isOpen, onClose, task, onSessionLogged }: PomodoroModalProps) {
  const [currentElapsedTime, setCurrentElapsedTime] = useState(0);

  const handleTimeUpdate = useCallback((timeInSeconds: number) => {
    setCurrentElapsedTime(timeInSeconds);
  }, []); // setCurrentElapsedTime is stable, so empty dependency array is fine.

  const handleLogSession = () => {
    onSessionLogged(currentElapsedTime);
    onClose(); // Close modal after logging
  };

  const getPriorityBadgeVariant = (priority?: 'Low' | 'Medium' | 'High') => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary'; 
      case 'Low': return 'outline'; 
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="full" className="p-4 sm:p-6 flex flex-col h-[90vh] sm:h-[80vh] w-[95vw] sm:w-[90vw] md:w-[70vw] lg:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold mb-2">Focus Session: {task.name}</DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-muted-foreground">
            Track your study time for this task. Press "Log Session" when done.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto space-y-4 mt-4 mb-4 pr-2">
            <div className="space-y-2 p-3 sm:p-4 border rounded-lg bg-card shadow-sm">
                <h3 className="font-semibold text-base sm:text-lg">Task Details</h3>
                {task.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground">{task.description}</p>
                )}
                <div className="flex flex-wrap gap-1 sm:gap-2 items-center text-xs sm:text-sm">
                    {task.priority && (
                      <Badge variant={getPriorityBadgeVariant(task.priority)}>Priority: {task.priority}</Badge>
                    )}
                    {task.deadline && (
                      <Badge variant="outline">Deadline: {format(new Date(task.deadline), 'PP')}</Badge>
                    )}
                    {task.requiredTime !== undefined && task.requiredTime !== null && (
                       <Badge variant="outline">Est. Time: {task.requiredTime} hr(s)</Badge>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center justify-center flex-grow p-2 sm:p-4 border rounded-lg bg-card shadow-sm min-h-0">
                <PomodoroTimer onTimeUpdate={handleTimeUpdate} />
            </div>
        </div>

        <DialogFooter className="mt-auto pt-4 border-t flex flex-col sm:flex-row gap-2">
          <Button variant="default" onClick={handleLogSession} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
            <Save className="mr-2 h-4 w-4" /> Log Session & Close
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
             <XCircle className="mr-2 h-4 w-4" /> Close Without Logging
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
