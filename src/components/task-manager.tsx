// src/components/task-manager.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Task, StudySession } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from '@/components/ui/progress';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlusCircle, Trash2, ListTodo, PlayCircle, CalendarIcon, Edit2, Save, X, BarChart, Clock } from 'lucide-react';
import { PomodoroModal } from '@/components/pomodoro-modal';
import { useUserProfile } from '@/contexts/user-profile-context';
import { format, parseISO, isValid, startOfDay, endOfDay, formatDuration, intervalToDuration } from 'date-fns';
import { useToast } from '@/hooks/use-toast';


interface TaskManagerProps {
  username: string;
}

const EMPTY_TASKS: Task[] = [];
const EMPTY_SESSIONS: StudySession[] = [];

// Helper to format duration in seconds to H M S or M S string
const formatSecondsToHMS = (seconds: number): string => {
  if (seconds < 0) seconds = 0;
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
  let formatted = "";
  if (duration.hours) formatted += `${duration.hours}h `;
  if (duration.minutes) formatted += `${duration.minutes}m `;
  if (seconds < 3600 && duration.seconds !== undefined) formatted += `${duration.seconds}s`; // show seconds if less than an hour total
  return formatted.trim() || "0s";
};


export function TaskManager({ username }: TaskManagerProps) {
  const tasksStorageKey = `ias-catalyst-tasks-${username}`;
  const sessionsStorageKey = `ias-catalyst-sessions-${username}`;

  const [tasks, setTasks] = useLocalStorage<Task[]>(tasksStorageKey, EMPTY_TASKS);
  const [studySessions, setStudySessions] = useLocalStorage<StudySession[]>(sessionsStorageKey, EMPTY_SESSIONS);

  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newRequiredTime, setNewRequiredTime] = useState('');
  const [newDeadline, setNewDeadline] = useState<Date | undefined>(undefined);
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');

  const [selectedTaskForPomodoro, setSelectedTaskForPomodoro] = useState<Task | null>(null);
  const [isPomodoroModalOpen, setIsPomodoroModalOpen] = useState(false);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // For Study Session Form
  const [sessionTaskId, setSessionTaskId] = useState<string>('');
  const [sessionDate, setSessionDate] = useState<Date | undefined>(new Date());
  const [sessionStartTime, setSessionStartTime] = useState('09:00');
  const [sessionEndTime, setSessionEndTime] = useState('10:00');
  const [sessionNotes, setSessionNotes] = useState('');


  const [isClient, setIsClient] = useState(false);
  const { addPoints, checkAndAwardBadgesForTaskCompletion } = useUserProfile(); // TODO: Add checkAndAwardBadgesForStudySession
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() === '') return;
    const newTask: Task = {
      id: Date.now().toString(),
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      requiredTime: newRequiredTime ? parseFloat(newRequiredTime) : undefined,
      deadline: newDeadline ? format(newDeadline, 'yyyy-MM-dd') : undefined,
      priority: newPriority,
      completed: false,
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    checkAndAwardBadgesForTaskCompletion(updatedTasks);

    setNewName('');
    setNewDescription('');
    setNewRequiredTime('');
    setNewDeadline(undefined);
    setNewPriority('Medium');
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || newName.trim() === '') return;

    const updatedTask: Task = {
        ...editingTask,
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        requiredTime: newRequiredTime ? parseFloat(newRequiredTime) : undefined,
        deadline: newDeadline ? format(newDeadline, 'yyyy-MM-dd') : undefined,
        priority: newPriority,
    };

    const updatedTasks = tasks.map(t => t.id === editingTask.id ? updatedTask : t);
    setTasks(updatedTasks);
    setEditingTask(null); // Exit editing mode
    setNewName('');
    setNewDescription('');
    setNewRequiredTime('');
    setNewDeadline(undefined);
    setNewPriority('Medium');
    toast({ title: "Task Updated", description: `Task "${updatedTask.name}" has been updated.`});
  };


  const toggleTask = (id: string) => {
    let pointsChange = 0;
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const nowCompleted = !task.completed;
        if (nowCompleted && !task.completionDate) { 
          pointsChange = 10; 
          return { ...task, completed: true, completionDate: Date.now() };
        } else if (!nowCompleted) { 
          return { ...task, completed: false, completionDate: undefined };
        }
        return { ...task, completed: !task.completed }; 
      }
      return task;
    });

    setTasks(updatedTasks);
    if (pointsChange > 0) {
      addPoints(pointsChange);
    }
    checkAndAwardBadgesForTaskCompletion(updatedTasks);
  };

  const startEditingTask = (task: Task) => {
    setEditingTask(task);
    setNewName(task.name);
    setNewDescription(task.description || '');
    setNewRequiredTime(task.requiredTime?.toString() || '');
    setNewDeadline(task.deadline ? parseISO(task.deadline) : undefined);
    setNewPriority(task.priority || 'Medium');
  };

  const cancelEditingTask = () => {
    setEditingTask(null);
    setNewName('');
    setNewDescription('');
    setNewRequiredTime('');
    setNewDeadline(undefined);
    setNewPriority('Medium');
  };


  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    setStudySessions(prevSessions => prevSessions.filter(session => session.taskId !== id));
    checkAndAwardBadgesForTaskCompletion(updatedTasks);
    toast({ title: "Task Deleted", variant: "destructive" });
  };

  const startPomodoroSession = (task: Task) => {
    setSelectedTaskForPomodoro(task);
    setIsPomodoroModalOpen(true);
  };

  const closePomodoroModal = () => {
    setIsPomodoroModalOpen(false);
    setSelectedTaskForPomodoro(null);
  };

  const handleAddStudySession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTaskId || !sessionDate || !sessionStartTime || !sessionEndTime) {
        toast({title: "Missing Information", description: "Please select a task, date, and times.", variant: "destructive"});
        return;
    }

    const task = tasks.find(t => t.id === sessionTaskId);
    if (!task) {
        toast({title: "Task Not Found", variant: "destructive"});
        return;
    }

    const [startHour, startMinute] = sessionStartTime.split(':').map(Number);
    const [endHour, endMinute] = sessionEndTime.split(':').map(Number);

    const sessionStartDate = new Date(sessionDate);
    sessionStartDate.setHours(startHour, startMinute, 0, 0);

    const sessionEndDate = new Date(sessionDate);
    sessionEndDate.setHours(endHour, endMinute, 0, 0);

    if (sessionEndDate <= sessionStartDate) {
        toast({title: "Invalid Time", description: "End time must be after start time.", variant: "destructive"});
        return;
    }

    const newSession: StudySession = {
      id: Date.now().toString(),
      taskId: sessionTaskId,
      taskName: task.name,
      startTime: sessionStartDate.getTime(),
      endTime: sessionEndDate.getTime(),
      notes: sessionNotes.trim() || undefined,
    };
    setStudySessions(prev => [...prev, newSession].sort((a,b) => b.startTime - a.startTime));
    toast({title: "Study Session Scheduled!", description: `Session for "${task.name}" added.`});
    setSessionTaskId('');
    setSessionStartTime('09:00');
    setSessionEndTime('10:00');
    setSessionNotes('');
  };

  const handleSessionLogged = (durationInSeconds: number) => {
    if (!selectedTaskForPomodoro) return;

    const sessionEndTimeMs = Date.now();
    const sessionStartTimeMs = sessionEndTimeMs - (durationInSeconds * 1000);

    const newSession: StudySession = {
      id: Date.now().toString(),
      taskId: selectedTaskForPomodoro.id,
      taskName: selectedTaskForPomodoro.name,
      startTime: sessionStartTimeMs,
      endTime: sessionEndTimeMs,
      // notes: // Could add a notes field to PomodoroModal if desired
    };
    setStudySessions(prev => [...prev, newSession].sort((a,b) => b.startTime - a.startTime));
    
    const pointsForSession = 5; // Example points for logging a session
    addPoints(pointsForSession);
    toast({ title: "Study Session Logged!", description: `You studied for ${formatSecondsToHMS(durationInSeconds)} and earned ${pointsForSession} points.` });
    
    // Placeholder for badge checking:
    // checkAndAwardBadgesForStudySession(newSession, studySessions); 
    // (This would require a new function in UserProfileContext and new badge definitions)

    // PomodoroModal will close itself after calling this
  };

  const deleteStudySession = (sessionId: string) => {
    setStudySessions(prev => prev.filter(s => s.id !== sessionId));
    toast({ title: "Study Session Deleted", variant: "destructive"});
  };


  const taskCompletionPercentage = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.completed).length;
    return (completedTasks / tasks.length) * 100;
  }, [tasks]);

  const calendarModifiers = useMemo(() => {
    const modifiers: Record<string, any> = {};
    tasks.forEach(task => {
      if (task.deadline && isValid(parseISO(task.deadline))) {
        const dateStr = format(parseISO(task.deadline), 'yyyy-MM-dd');
        if (!modifiers[dateStr]) modifiers[dateStr] = { tasks: [], sessions: [] };
        modifiers[dateStr].tasks.push(task.name);
        modifiers[dateStr].deadline = true;
      }
    });

    studySessions.forEach(session => {
        const dateStr = format(new Date(session.startTime), 'yyyy-MM-dd');
        if (!modifiers[dateStr]) modifiers[dateStr] = { tasks: [], sessions: [] };
        if (!modifiers[dateStr].sessions) modifiers[dateStr].sessions = [];
        modifiers[dateStr].sessions.push(session);
        modifiers[dateStr].sessionDay = true;
    });
    return modifiers;
  }, [tasks, studySessions]);

  const calendarModifierStyles = {
    deadline: { border: '2px solid hsl(var(--destructive))', borderRadius: '50%' },
    sessionDay: { backgroundColor: 'hsla(var(--primary), 0.2)', borderRadius: '8px' },
    deadlineAndSessionDay: {
        border: '2px solid hsl(var(--destructive))',
        backgroundColor: 'hsla(var(--primary), 0.2)',
        borderRadius: '8px'
    }
  };

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(new Date());

  const tasksForSelectedDate = useMemo(() => {
    if (!selectedCalendarDate) return [];
    const dateStr = format(selectedCalendarDate, 'yyyy-MM-dd');
    return tasks.filter(task => task.deadline === dateStr);
  }, [selectedCalendarDate, tasks]);

  const sessionsForSelectedDate = useMemo(() => {
    if (!selectedCalendarDate) return [];
    const dateStr = format(selectedCalendarDate, 'yyyy-MM-dd');
    return studySessions.filter(session => format(new Date(session.startTime), 'yyyy-MM-dd') === dateStr)
                        .sort((a,b) => a.startTime - b.startTime);
  }, [selectedCalendarDate, studySessions]);

  const todaysStudyActivity = useMemo(() => {
    const todayStart = startOfDay(new Date()).getTime();
    const todayEnd = endOfDay(new Date()).getTime();
    const todaysSessions = studySessions.filter(s => s.startTime >= todayStart && s.startTime <= todayEnd);
    const totalDurationSeconds = todaysSessions.reduce((sum, s) => sum + (s.endTime - s.startTime) / 1000, 0);
    return {
      sessions: todaysSessions.sort((a, b) => b.startTime - a.startTime),
      count: todaysSessions.length,
      totalDurationFormatted: formatSecondsToHMS(totalDurationSeconds),
    };
  }, [studySessions]);


  if (!isClient) {
    return <div className="p-4"><Card><CardHeader><CardTitle>Loading Tasks...</CardTitle></CardHeader></Card></div>;
  }

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <ListTodo className="w-6 h-6" /> Task & Schedule Manager
          </CardTitle>
          <Progress value={taskCompletionPercentage} className="w-full h-2 mt-2" />
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            {tasks.length > 0 ? `${taskCompletionPercentage.toFixed(0)}% of tasks completed.` : "Add tasks to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6">
          <div className="space-y-4 md:space-y-6">
            <Card className="bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{editingTask ? "Edit Task" : "Add New Task"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingTask ? handleUpdateTask : handleAddTask} className="space-y-3">
                  <div>
                    <Label htmlFor="task-name">Task Name</Label>
                    <Input id="task-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Read Chapter 5" required />
                  </div>
                  <div>
                    <Label htmlFor="task-description">Description (Optional)</Label>
                    <Textarea id="task-description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="More details..." rows={2}/>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="task-priority">Priority</Label>
                      <Select value={newPriority} onValueChange={(v) => setNewPriority(v as 'Low'|'Medium'|'High')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                        <Label htmlFor="task-deadline">Deadline (Optional)</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {newDeadline ? format(newDeadline, 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={newDeadline} onSelect={setNewDeadline} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="task-req-time">Est. Time (hrs, Opt.)</Label>
                    <Input id="task-req-time" type="number" value={newRequiredTime} onChange={(e) => setNewRequiredTime(e.target.value)} placeholder="e.g., 2.5" min="0" step="0.1"/>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      {editingTask ? <><Save className="mr-2 h-4 w-4"/>Save Changes</> : <><PlusCircle className="mr-2 h-4 w-4" />Add Task</>}
                    </Button>
                    {editingTask && (
                        <Button type="button" variant="outline" onClick={cancelEditingTask} className="w-full">
                           <X className="mr-2 h-4 w-4"/> Cancel
                        </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {tasks.length === 0 && !editingTask ? (
              <p className="text-muted-foreground text-center py-4">No tasks yet. Add your first task!</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {tasks.sort((a,b) => (a.completed ? 1 : -1) - (b.completed ? 1 : -1) || (a.deadline && b.deadline ? parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime() : 0)).map((task) => (
                  <Card key={task.id} className={`p-3 ${task.completed ? 'bg-muted/30' : 'bg-card'}`}>
                    <div className="flex items-start gap-2">
                      <Checkbox id={`task-${task.id}`} checked={task.completed} onCheckedChange={() => toggleTask(task.id)} className="mt-1" />
                      <div className="flex-grow space-y-1">
                        <label htmlFor={`task-${task.id}`} className={`font-semibold cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.name}
                        </label>
                         {task.description && <p className="text-xs sm:text-sm text-muted-foreground">{task.description}</p>}
                         <div className="flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            {task.priority && <span>Priority: <span className={`font-medium ${task.priority === 'High' ? 'text-red-500' : task.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>{task.priority}</span></span>}
                            {task.deadline && <span>Deadline: {format(parseISO(task.deadline), 'MMM d, yyyy')}</span>}
                            {task.requiredTime && <span>Est: {task.requiredTime} hr(s)</span>}
                         </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-0 ml-auto">
                        {!task.completed && (
                           <Button variant="ghost" size="icon" onClick={() => startEditingTask(task)} title="Edit Task" className="h-7 w-7 sm:h-8 sm:w-8"><Edit2 className="h-4 w-4"/></Button>
                        )}
                         <Button variant="ghost" size="icon" onClick={() => startPomodoroSession(task)} title="Start Focus Session" className="h-7 w-7 sm:h-8 sm:w-8"><PlayCircle className="h-4 w-4 text-primary"/></Button>
                         <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} title="Delete Task" className="h-7 w-7 sm:h-8 sm:w-8"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 md:space-y-6">
            <Card className="bg-card shadow-sm">
                <CardHeader><CardTitle className="text-lg">Study Calendar</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center">
                <Calendar
                    mode="single"
                    selected={selectedCalendarDate}
                    onSelect={setSelectedCalendarDate}
                    className="rounded-md border scale-90 sm:scale-100"
                    modifiers={calendarModifiers}
                    modifiersStyles={calendarModifierStyles}
                    components={{
                        DayContent: ({ date }) => {
                            const dateKey = format(date, 'yyyy-MM-dd');
                            const dayHasDeadline = calendarModifiers[dateKey]?.deadline;
                            const dayHasSession = calendarModifiers[dateKey]?.sessionDay;
                            return (
                                <div className="relative w-full h-full flex items-center justify-center">
                                {date.getDate()}
                                {dayHasDeadline && <span className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 bg-destructive rounded-full" title="Task Deadline"></span>}
                                {dayHasSession && <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-primary rounded-full" title="Study Session"></span>}
                                </div>
                            );
                        }
                    }}
                />
                {selectedCalendarDate && (
                    <div className="mt-4 w-full space-y-2 px-2 sm:px-0">
                        <h4 className="font-semibold text-sm sm:text-base">On {format(selectedCalendarDate, 'PPP')}:</h4>
                        {tasksForSelectedDate.length > 0 && (
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-destructive">Deadlines:</p>
                                <ul className="list-disc list-inside text-xs sm:text-sm">
                                    {tasksForSelectedDate.map(t => <li key={t.id}>{t.name}</li>)}
                                </ul>
                            </div>
                        )}
                        {sessionsForSelectedDate.length > 0 && (
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-primary">Study Sessions:</p>
                                {sessionsForSelectedDate.map(s => (
                                    <Card key={s.id} className="p-2 my-1 text-xs bg-primary/5">
                                        <div className="flex justify-between items-center">
                                            <span className="flex-grow mr-1 truncate">{s.taskName} ({formatSecondsToHMS((s.endTime - s.startTime) / 1000)})</span>
                                            <Button variant="ghost" size="icon" onClick={() => deleteStudySession(s.id)} className="h-6 w-6 flex-shrink-0"><Trash2 className="h-3 w-3 text-destructive"/></Button>
                                        </div>
                                        {s.notes && <p className="text-muted-foreground text-xs italic mt-0.5">{s.notes}</p>}
                                    </Card>
                                ))}
                            </div>
                        )}
                        {tasksForSelectedDate.length === 0 && sessionsForSelectedDate.length === 0 && (
                            <p className="text-xs sm:text-sm text-muted-foreground">No deadlines or scheduled sessions.</p>
                        )}
                    </div>
                )}
                </CardContent>
            </Card>

            <Card className="bg-card shadow-sm">
              <CardHeader><CardTitle className="text-lg">Schedule Study Session</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddStudySession} className="space-y-3">
                  <div>
                    <Label htmlFor="session-task">Task</Label>
                    <Select value={sessionTaskId} onValueChange={setSessionTaskId}>
                      <SelectTrigger id="session-task"><SelectValue placeholder="Select a task" /></SelectTrigger>
                      <SelectContent>
                        {tasks.filter(t => !t.completed).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="session-date">Date</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button id="session-date" variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {sessionDate ? format(sessionDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={sessionDate} onSelect={setSessionDate} initialFocus /></PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label htmlFor="session-start-time">Start Time</Label><Input id="session-start-time" type="time" value={sessionStartTime} onChange={e => setSessionStartTime(e.target.value)} /></div>
                    <div><Label htmlFor="session-end-time">End Time</Label><Input id="session-end-time" type="time" value={sessionEndTime} onChange={e => setSessionEndTime(e.target.value)} /></div>
                  </div>
                  <div><Label htmlFor="session-notes">Notes (Opt.)</Label><Input id="session-notes" value={sessionNotes} onChange={e => setSessionNotes(e.target.value)} placeholder="e.g. Focus on definitions"/></div>
                  <Button type="submit" className="w-full">Schedule Session</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart className="w-5 h-5 text-primary" /> Today's Study Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm">Total Sessions Today: <span className="font-semibold text-primary">{todaysStudyActivity.count}</span></p>
                    <p className="text-sm">Total Time Studied Today: <span className="font-semibold text-primary">{todaysStudyActivity.totalDurationFormatted}</span></p>
                    {todaysStudyActivity.sessions.length > 0 && (
                        <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
                            <h4 className="text-xs font-medium text-muted-foreground">Sessions Logged:</h4>
                            {todaysStudyActivity.sessions.map(session => (
                                <Card key={session.id} className="p-2 text-xs bg-muted/50">
                                     <div className="flex justify-between items-center">
                                        <span className="font-medium truncate flex-1 mr-2" title={session.taskName}>{session.taskName}</span>
                                        <span className="text-primary flex-shrink-0">{formatSecondsToHMS((session.endTime - session.startTime) / 1000)}</span>
                                    </div>
                                    <p className="text-muted-foreground text-[10px]">{format(new Date(session.startTime), 'p')} - {format(new Date(session.endTime), 'p')}</p>
                                    {session.notes && <p className="text-muted-foreground text-[10px] italic mt-0.5">{session.notes}</p>}
                                </Card>
                            ))}
                        </div>
                    )}
                    {todaysStudyActivity.count === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">No study sessions logged today.</p>
                    )}
                </CardContent>
            </Card>

          </div>
        </CardContent>
      </Card>

      {selectedTaskForPomodoro && isPomodoroModalOpen && (
        <PomodoroModal
          isOpen={isPomodoroModalOpen}
          onClose={closePomodoroModal}
          task={selectedTaskForPomodoro}
          onSessionLogged={handleSessionLogged}
        />
      )}
    </>
  );
}
