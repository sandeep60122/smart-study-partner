// src/components/task-manager.tsx
"use client";

import React, { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, ListTodo, PlayCircle } from 'lucide-react';
import { PomodoroModal } from '@/components/pomodoro-modal'; // Import the new modal

interface TaskManagerProps {
  username: string; // Used to key local storage
}

const EMPTY_TASKS: Task[] = [];

export function TaskManager({ username }: TaskManagerProps) {
  const storageKey = `ias-catalyst-tasks-${username}`;
  const [tasks, setTasks] = useLocalStorage<Task[]>(storageKey, EMPTY_TASKS);

  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newRequiredTime, setNewRequiredTime] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isPomodoroModalOpen, setIsPomodoroModalOpen] = useState(false);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Effect to handle potential data migration from old task format (text -> name)
  useEffect(() => {
    if (isClient) {
      // Read current tasks from localStorage directly to check format
      const storedTasksString = window.localStorage.getItem(storageKey);
      if (storedTasksString) {
        try {
          const storedTasks = JSON.parse(storedTasksString) as Array<any>;
          let migrated = false;
          const updatedTasks = storedTasks.map(task => {
            if (task && typeof task.text !== 'undefined' && typeof task.name === 'undefined') {
              migrated = true;
              const { text, ...rest } = task;
              return { ...rest, name: text };
            }
            return task;
          });

          if (migrated) {
            setTasks(updatedTasks);
          }
        } catch (error) {
          console.warn("Error migrating tasks from localStorage", error);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, storageKey]); // setTasks is stable, run once on client mount & key change


  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() === '') return;
    const newTask: Task = {
      id: Date.now().toString(),
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      requiredTime: newRequiredTime ? parseFloat(newRequiredTime) : undefined,
      deadline: newDeadline || undefined,
      priority: newPriority,
      completed: false,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    setNewName('');
    setNewDescription('');
    setNewRequiredTime('');
    setNewDeadline('');
    setNewPriority('Medium');
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

  const startPomodoroSession = (task: Task) => {
    setSelectedTask(task);
    setIsPomodoroModalOpen(true);
  };

  const closePomodoroModal = () => {
     setIsPomodoroModalOpen(false);
     setSelectedTask(null); // Clear selected task on close
  }

  if (!isClient) {
     return <div className="p-4"><Card><CardHeader><CardTitle>Loading Tasks...</CardTitle></CardHeader></Card></div>;
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="w-6 h-6" /> Task Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addTask} className="space-y-4 mb-6 p-4 border rounded-lg bg-card shadow">
            <div>
              <Label htmlFor="task-name" className="block text-sm font-medium mb-1">Task Name</Label>
              <Input
                id="task-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Read Chapter 5"
                required
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="task-description" className="block text-sm font-medium mb-1">Description (Optional)</Label>
              <Textarea
                id="task-description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Add more details about the task..."
                rows={3}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="task-priority" className="block text-sm font-medium mb-1">Priority</Label>
                <Select value={newPriority} onValueChange={(value: string) => setNewPriority(value as 'Low' | 'Medium' | 'High')}>
                  <SelectTrigger id="task-priority" className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="task-deadline" className="block text-sm font-medium mb-1">Deadline (Optional)</Label>
                <Input
                  id="task-deadline"
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="task-req-time" className="block text-sm font-medium mb-1">Required Time (hrs, Opt.)</Label>
                <Input
                  id="task-req-time"
                  type="number"
                  value={newRequiredTime}
                  onChange={(e) => setNewRequiredTime(e.target.value)}
                  placeholder="e.g., 2.5"
                  min="0"
                  step="0.1"
                  className="w-full"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </form>

          {tasks.length === 0 ? (
             <p className="text-muted-foreground text-center py-4">No tasks yet. Add your first task above!</p>
          ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task.id} className="flex flex-col gap-1 p-3 rounded-md border bg-card shadow-sm hover:bg-secondary/80 transition-colors">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    aria-labelledby={`task-name-${task.id}`}
                  />
                  <label
                    htmlFor={`task-${task.id}`}
                    id={`task-name-${task.id}`}
                    className={`flex-grow font-semibold cursor-pointer text-base ${task.completed ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}
                  >
                    {task.name || 'Untitled Task'}
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startPomodoroSession(task)}
                    className="text-primary hover:bg-primary/10"
                    aria-label={`Start Pomodoro session for task: ${task.name || 'Untitled Task'}`}
                    title="Start Pomodoro Session"
                  >
                    <PlayCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                    className="text-destructive hover:bg-destructive/10"
                    aria-label={`Delete task: ${task.name || 'Untitled Task'}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground ml-8">{task.description}</p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 ml-8 mt-1 text-xs text-muted-foreground">
                  {task.priority && (
                    <span>Priority: <span className={`font-medium ${
                      task.priority === 'High' ? 'text-red-500' :
                      task.priority === 'Medium' ? 'text-yellow-600' :
                      'text-green-600' // Low priority
                    }`}>{task.priority}</span></span>
                  )}
                  {task.deadline && (
                    <span>Deadline: {new Date(task.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  )}
                  {task.requiredTime !== undefined && task.requiredTime !== null && (
                    <span>Est. Time: {task.requiredTime} hr(s)</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
           )}
        </CardContent>
      </Card>

      {selectedTask && (
         <PomodoroModal
            isOpen={isPomodoroModalOpen}
            onClose={closePomodoroModal}
            task={selectedTask}
         />
      )}
    </>
  );
}
