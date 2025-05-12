// src/components/auth.tsx
"use client";

import React, { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { User, LogIn, LogOut } from 'lucide-react';

interface AuthManagerProps {
  onAuthChange: (username: string | null) => void;
}

export function AuthManager({ onAuthChange }: AuthManagerProps) {
  const [username, setUsername] = useLocalStorage<string | null>('ias-catalyst-user', null);
  const [inputValue, setInputValue] = useState('');
   const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
     if (isClient) {
        onAuthChange(username);
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, onAuthChange, isClient]);


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setUsername(inputValue.trim());
      setInputValue(''); // Clear input after login
    }
  };

  const handleLogout = () => {
    setUsername(null);
     onAuthChange(null); // Immediately notify parent
  };

  if (!isClient) {
     // Render placeholder or null during SSR/hydration phase
     return <div className="p-4"><Card><CardHeader><CardTitle>Loading User...</CardTitle></CardHeader></Card></div>;
   }


  return (
    <div className="p-4">
      {username ? (
        <Card className="w-full max-w-sm mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Welcome, {username}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={handleLogout} className="w-full">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="w-full max-w-sm mx-auto">
           <CardHeader>
             <CardTitle>Login</CardTitle>
           </CardHeader>
           <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Enter a username</Label>
                <Input
                  id="username"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g., aspirant123"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                 <LogIn className="mr-2 h-4 w-4" /> Login / Register
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
              No password needed. Your data (tasks) will be stored locally in your browser under this username.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
