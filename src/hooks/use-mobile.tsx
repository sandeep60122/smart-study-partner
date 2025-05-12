// src/hooks/use-mobile.tsx
"use client"; // Ensure this runs only on the client

import * as React from "react";

const MOBILE_BREAKPOINT = 768; // md breakpoint in Tailwind

export function useIsMobile() {
  // Initialize state to undefined to avoid hydration issues
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Check if window is defined (ensures client-side execution)
    if (typeof window === "undefined") {
      return;
    }

    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Initial check
    checkDevice();

    // Listener for window resize
    window.addEventListener("resize", checkDevice);

    // Cleanup listener
    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Return the state; will be undefined during SSR/initial render, then boolean
  return isMobile;
}
