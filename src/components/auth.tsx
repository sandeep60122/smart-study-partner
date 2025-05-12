// src/components/auth.tsx
"use client";

import React, { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { User, LogIn, LogOut } from 'lucide-react';
import { useUserProfile } from '@/contexts/user-profile-context'; // Import useUserProfile

interface AuthManagerProps {
  onAuthChange: (username: string | null) => void;
}

export function AuthManager({ onAuthChange }: AuthManagerProps) {
  const [username, setUsername] = useLocalStorage<string | null>('ias-catalyst-user', null);
  const [inputValue, setInputValue] = useState('');
  const [isClient, setIsClient] = useState(false);
  const { loadProfile, clearProfile, profile } = useUserProfile(); // Use the context

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
     if (isClient) {
        onAuthChange(username);
        if (username) {
          loadProfile(username);
        } else {
          clearProfile();
        }
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, isClient, loadProfile, clearProfile]); // Removed onAuthChange from deps as it causes re-runs from parent


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const newUsername = inputValue.trim();
      setUsername(newUsername);
      // onAuthChange and loadProfile will be called by the useEffect above
      setInputValue('');
    }
  };

  const handleLogout = () => {
    setUsername(null);
    // onAuthChange and clearProfile will be called by the useEffect above
  };

  if (!isClient) {
     return <Card className="w-full max-w-xs"><CardHeader><CardTitle>Loading...</CardTitle></CardHeader></Card>;
   }

  const displayUsername = profile?.username || username;

  return (
    <div>
      {displayUsername ? (
        // Make card full width on small screens, max-w-xs on larger screens
        <Card className="w-full sm:max-w-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" />
              {displayUsername}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0">
             {profile && <p className="text-xs text-muted-foreground">Points: {profile.points}</p>}
          </CardContent>
          <CardFooter className="pt-2">
            <Button variant="outline" onClick={handleLogout} className="w-full text-xs px-2 py-1 h-auto">
              <LogOut className="mr-1 h-3 w-3" /> Logout
            </Button>
          </CardFooter>
        </Card>
      ) : (
        // Make card full width on small screens, max-w-xs on larger screens
        <Card className="w-full sm:max-w-xs">
           <CardHeader>
             <CardTitle className="text-lg">Login</CardTitle>
           </CardHeader>
           <CardContent>
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="username-auth" className="text-xs">Username</Label>
                <Input
                  id="username-auth"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="aspirant123"
                  required
                  className="h-8 text-sm"
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-2 py-1 h-auto">
                 <LogIn className="mr-1 h-3 w-3" /> Login / Register
              </Button>
            </form>
          </CardContent>
          <CardFooter className="mt-2">
            <p className="text-xs text-muted-foreground text-center w-full leading-tight">
              No password needed. Data is stored locally.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
