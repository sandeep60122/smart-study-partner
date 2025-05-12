// src/components/pomodoro-modal.tsx
"use client";

import React from 'react';
import type { Task } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PomodoroTimer } from '@/components/pomodoro-timer'; // Import the timer component
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

export function PomodoroModal({ isOpen, onClose, task }: PomodoroModalProps) {

  const getPriorityBadgeVariant = (priority?: 'Low' | 'Medium' | 'High') => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary'; // Or another suitable variant
      case 'Low': return 'outline'; // Or another suitable variant
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Use size="full" variant from Dialog component and adjust padding/height */}
      <DialogContent size="full" className="p-4 sm:p-6 flex flex-col h-[90vh] sm:h-[80vh] w-[95vw] sm:w-[90vw] md:w-[70vw] lg:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold mb-2">Pomodoro Session: {task.name}</DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-muted-foreground">
            Focus on completing your task with timed work and break intervals.
          </DialogDescription>
        </DialogHeader>

        {/* flex-grow allows this section to take available space */}
        <div className="flex-grow overflow-y-auto space-y-4 mt-4 mb-4 pr-2">
            {/* Task Details */}
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

            {/* Pomodoro Timer */}
             {/* Added min-h-0 to prevent timer card from overflowing flex container */}
            <div className="flex flex-col items-center justify-center flex-grow p-2 sm:p-4 border rounded-lg bg-card shadow-sm min-h-0">
                <PomodoroTimer />
            </div>
        </div>


        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
