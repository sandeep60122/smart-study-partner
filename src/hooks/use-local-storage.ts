// src/hooks/use-local-storage.ts
"use client";

import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Ensure this code only runs on the client
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const readValue = useCallback((): T => {
    if (!isClient) {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [isClient, key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Update state when key, initialValue or isClient changes
  useEffect(() => {
    setStoredValue(readValue());
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, initialValue, isClient, readValue]);

  const setValue = (value: T | ((val: T) => T)) => {
    if (!isClient) {
      console.warn(`Tried setting localStorage key “${key}” even though environment is not client-side`);
      return;
    }

    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };


  // Listen for storage changes from other tabs
   useEffect(() => {
    if (!isClient) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.storageArea === window.localStorage) {
        try {
           setStoredValue(event.newValue ? JSON.parse(event.newValue) : initialValue);
        } catch (error) {
            console.warn(`Error parsing storage change for key “${key}”:`, error);
             setStoredValue(initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isClient, key, initialValue]);


  return [storedValue, setValue];
}

export default useLocalStorage;
