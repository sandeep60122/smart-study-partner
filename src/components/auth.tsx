// src/components/auth.tsx
"use client";

import React, { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from '@/components/ui/sheet'; // Import Sheet components
import { User, LogIn, LogOut, Menu } from 'lucide-react';
import { useUserProfile } from '@/contexts/user-profile-context'; // Import useUserProfile
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile hook

interface AuthManagerProps {
  onAuthChange: (username: string | null) => void;
}

export function AuthManager({ onAuthChange }: AuthManagerProps) {
  const [username, setUsername] = useLocalStorage<string | null>('ias-catalyst-user', null);
  const [inputValue, setInputValue] = useState('');
  const [isClient, setIsClient] = useState(false);
  const { loadProfile, clearProfile, profile } = useUserProfile(); // Use the context
  const isMobile = useIsMobile(); // Check if mobile view
  const [isSheetOpen, setIsSheetOpen] = useState(false); // State for sheet


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
      setInputValue('');
      setIsSheetOpen(false); // Close sheet after login
    }
  };

  const handleLogout = () => {
    setUsername(null);
    setIsSheetOpen(false); // Close sheet after logout
  };

  if (!isClient) {
     return <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>; // Simple loading indicator
   }

  const displayUsername = profile?.username || username;

  // Desktop View: The original Card layout
  const DesktopView = () => (
    <div>
      {displayUsername ? (
        <Card className="w-full sm:max-w-xs">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" />
              {displayUsername}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-1">
             {profile && <p className="text-xs text-muted-foreground">Points: {profile.points}</p>}
          </CardContent>
          <CardFooter className="pt-2">
            <Button variant="outline" onClick={handleLogout} className="w-full text-xs px-2 py-1 h-auto">
              <LogOut className="mr-1 h-3 w-3" /> Logout
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="w-full sm:max-w-xs">
           <CardHeader>
             <CardTitle className="text-lg">Login</CardTitle>
           </CardHeader>
           <CardContent>
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="username-auth-desktop" className="text-xs">Username</Label>
                <Input
                  id="username-auth-desktop"
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

  // Mobile View: Hamburger menu triggering a Sheet
  const MobileView = () => (
     <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                  {displayUsername ? <User className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  <span className="sr-only">Open user menu</span>
              </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                  <SheetTitle>{displayUsername ? `Welcome, ${displayUsername}` : 'Login / Register'}</SheetTitle>
                  {displayUsername && profile && (
                     <SheetDescription>Points: {profile.points}</SheetDescription>
                  )}
              </SheetHeader>
              <div className="py-6">
                  {displayUsername ? (
                      <div className="space-y-4">
                          {/* Add any other mobile profile details/links here if needed */}
                          <Button variant="outline" onClick={handleLogout} className="w-full">
                              <LogOut className="mr-2 h-4 w-4" /> Logout
                          </Button>
                      </div>
                  ) : (
                      <form onSubmit={handleLogin} className="space-y-4">
                          <div className="space-y-1">
                              <Label htmlFor="username-auth-mobile">Username</Label>
                              <Input
                                  id="username-auth-mobile"
                                  type="text"
                                  value={inputValue}
                                  onChange={(e) => setInputValue(e.target.value)}
                                  placeholder="aspirant123"
                                  required
                              />
                          </div>
                          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                              <LogIn className="mr-2 h-4 w-4" /> Login / Register
                          </Button>
                          <p className="text-xs text-muted-foreground text-center pt-2">
                              No password needed. Data is stored locally.
                          </p>
                      </form>
                  )}
              </div>
               <SheetFooter>
                {/* Optional footer content */}
               </SheetFooter>
          </SheetContent>
      </Sheet>
  );

  return isMobile ? <MobileView /> : <DesktopView />;
}
