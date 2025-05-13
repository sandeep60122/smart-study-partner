// src/components/auth.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { User, LogIn, LogOut } from 'lucide-react';
import { useUserProfile } from '@/contexts/user-profile-context';
import { useIsMobile } from '@/hooks/use-mobile';

interface AuthManagerProps {
  onAuthChange: (username: string | null) => void;
}

// Moved LoginView outside AuthManager to stabilize its instance
const LoginView = React.memo(({
  handleLogin,
  inputValue,
  setInputValue
}: {
  handleLogin: (e: React.FormEvent) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
}) => {
  return (
    <Card className="w-full sm:max-w-xs">
      <CardHeader>
        <CardTitle className="text-lg">Login / Register</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="username-auth-stable" className="text-xs">Username</Label>
            <Input
              id="username-auth-stable" // Changed ID for clarity
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
  );
});
LoginView.displayName = 'LoginView';


// Moved LoggedInDesktopView outside AuthManager
const LoggedInDesktopView = React.memo(({
  displayUsername,
  profilePoints,
  handleLogout
}: {
  displayUsername: string;
  profilePoints: number | undefined;
  handleLogout: () => void;
}) => {
  return (
    <Card className="w-full sm:max-w-xs">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="w-4 h-4" />
          {displayUsername}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-1">
        {profilePoints !== undefined && <p className="text-xs text-muted-foreground">Points: {profilePoints}</p>}
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" onClick={handleLogout} className="w-full text-xs px-2 py-1 h-auto">
          <LogOut className="mr-1 h-3 w-3" /> Logout
        </Button>
      </CardFooter>
    </Card>
  );
});
LoggedInDesktopView.displayName = 'LoggedInDesktopView';

// Moved LoggedInMobileView outside AuthManager
const LoggedInMobileView = React.memo(({
  displayUsername,
  profilePoints,
  handleLogout,
  isSheetOpen,
  setIsSheetOpen
}: {
  displayUsername: string;
  profilePoints: number | undefined;
  handleLogout: () => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (isOpen: boolean) => void;
}) => {
  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-foreground">
          <User className="h-5 w-5" />
          <span className="sr-only">Open user menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[320px]">
        <SheetHeader>
          <SheetTitle>Welcome, {displayUsername}</SheetTitle>
          {profilePoints !== undefined && (
            <SheetDescription>Points: {profilePoints}</SheetDescription>
          )}
        </SheetHeader>
        <div className="py-6">
          <div className="space-y-4">
            <Button variant="outline" onClick={handleLogout} className="w-full">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
        <SheetFooter>
          {/* Optional footer content */}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
});
LoggedInMobileView.displayName = 'LoggedInMobileView';

export function AuthManager({ onAuthChange }: AuthManagerProps) {
  const [username, setUsername] = useLocalStorage<string | null>('ias-catalyst-user', null);
  const [inputValue, setInputValue] = useState('');
  const [isClient, setIsClient] = useState(false);
  const { loadProfile, clearProfile, profile } = useUserProfile();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const stableOnAuthChange = useCallback(onAuthChange, []); // Memoize onAuthChange if it's passed from parent and could change

  useEffect(() => {
    if (isClient) {
      stableOnAuthChange(username);
      if (username) {
        loadProfile(username);
      } else {
        clearProfile();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, isClient, loadProfile, clearProfile, stableOnAuthChange]);


  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const newUsername = inputValue.trim();
      setUsername(newUsername);
      setInputValue(''); // Clear input after setting username
      if (isMobile) setIsSheetOpen(false); // Close sheet on mobile after login attempt
    }
  }, [inputValue, setUsername, isMobile, setIsSheetOpen]);

  const handleLogout = useCallback(() => {
    setUsername(null);
    if (isMobile) setIsSheetOpen(false); // Close sheet on mobile after logout
  }, [setUsername, isMobile, setIsSheetOpen]);

  if (!isClient) {
    return <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>;
  }

  const displayUsername = profile?.username || username;

  if (!displayUsername) {
    return <LoginView handleLogin={handleLogin} inputValue={inputValue} setInputValue={setInputValue} />;
  } else {
    return isMobile ? (
      <LoggedInMobileView
        displayUsername={displayUsername}
        profilePoints={profile?.points}
        handleLogout={handleLogout}
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
      />
    ) : (
      <LoggedInDesktopView
        displayUsername={displayUsername}
        profilePoints={profile?.points}
        handleLogout={handleLogout}
      />
    );
  }
}