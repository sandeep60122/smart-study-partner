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
      <DialogContent className="sm:max-w-[90vw] md:max-w-[70vw] lg:max-w-[600px] h-[80vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">Pomodoro Session: {task.name}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Focus on completing your task with timed work and break intervals.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto space-y-4 mt-4 mb-4 pr-2">
            {/* Task Details */}
            <div className="space-y-2 p-4 border rounded-lg bg-card shadow-sm">
                <h3 className="font-semibold text-lg">Task Details</h3>
                {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                )}
                <div className="flex flex-wrap gap-2 items-center text-sm">
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
            <div className="flex flex-col items-center justify-center flex-grow p-4 border rounded-lg bg-card shadow-sm">
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
