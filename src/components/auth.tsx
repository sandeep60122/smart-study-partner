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
     // Removed p-4 from wrapper div, Card itself will be sized by content
     return <Card className="w-full max-w-xs"><CardHeader><CardTitle>Loading...</CardTitle></CardHeader></Card>;
   }


  return (
    <div> {/* Removed p-4 from here, padding handled by wrapper in page.tsx */}
      {username ? (
        <Card className="w-full max-w-xs"> {/* Reduced max-w, removed mx-auto */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"> {/* Smaller text for compact view */}
              <User className="w-4 h-4" /> {/* Slightly smaller icon */}
              {username}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={handleLogout} className="w-full text-xs px-2 py-1 h-auto"> {/* Compact button */}
              <LogOut className="mr-1 h-3 w-3" /> Logout
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="w-full max-w-xs"> {/* Reduced max-w, removed mx-auto */}
           <CardHeader>
             <CardTitle className="text-lg">Login</CardTitle> {/* Slightly smaller title */}
           </CardHeader>
           <CardContent>
            <form onSubmit={handleLogin} className="space-y-3"> {/* Reduced space */}
              <div className="space-y-1"> {/* Reduced space */}
                <Label htmlFor="username-auth" className="text-xs">Username</Label> {/* Smaller label */}
                <Input
                  id="username-auth" // Unique ID for label
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="aspirant123"
                  required
                  className="h-8 text-sm" // Compact input
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-2 py-1 h-auto"> {/* Compact button */}
                 <LogIn className="mr-1 h-3 w-3" /> Login / Register
              </Button>
            </form>
          </CardContent>
          <CardFooter className="mt-2"> {/* Added mt-2 to separate from button */}
            <p className="text-xs text-muted-foreground text-center w-full leading-tight">
              No password needed. Data is stored locally.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
