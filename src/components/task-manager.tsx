// src/components/task-manager.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, ListTodo } from 'lucide-react';

interface TaskManagerProps {
  username: string; // Used to key local storage
}

const EMPTY_TASKS: Task[] = []; // Define a stable reference for initial tasks

export function TaskManager({ username }: TaskManagerProps) {
  const storageKey = `ias-catalyst-tasks-${username}`;
  const [tasks, setTasks] = useLocalStorage<Task[]>(storageKey, EMPTY_TASKS); // Use stable EMPTY_TASKS
  const [newTaskText, setNewTaskText] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() === '') return;
    const newTask: Task = {
      id: Date.now().toString(), // Simple ID generation
      text: newTaskText,
      completed: false,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  if (!isClient) {
     // Render placeholder or null during SSR/hydration phase
     return <div className="p-4"><Card><CardHeader><CardTitle>Loading Tasks...</CardTitle></CardHeader></Card></div>;
  }


  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="w-6 h-6" /> Task Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={addTask} className="flex gap-2 mb-4">
          <Input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new study task..."
            className="flex-grow"
            aria-label="New task"
          />
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:ml-2">Add Task</span>
          </Button>
        </form>
        {tasks.length === 0 ? (
           <p className="text-muted-foreground text-center py-4">No tasks yet. Add your first task above!</p>
        ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-secondary/80 transition-colors">
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                aria-labelledby={`task-label-${task.id}`}
              />
              <label
                htmlFor={`task-${task.id}`}
                id={`task-label-${task.id}`}
                className={`flex-grow cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : ''}`}
              >
                {task.text}
              </label>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTask(task.id)}
                className="text-destructive hover:bg-destructive/10"
                aria-label={`Delete task: ${task.text}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
         )}
      </CardContent>
    </Card>
  );
}

