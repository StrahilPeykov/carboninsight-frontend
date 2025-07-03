// Client-side component directive - required for DOM event listeners and browser APIs
"use client";

// Custom hook that handles global keyboard shortcut registration and event management
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// Props interface for the provider component - follows React provider pattern
// Accepts children components that will have access to keyboard shortcuts functionality
interface KeyboardShortcutsProviderProps {
  // React children prop for composition pattern - allows wrapping of child components
  children: React.ReactNode;
}

// KeyboardShortcutsProvider component - transparent wrapper that enables global keyboard shortcuts
export default function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  // Initialize global keyboard shortcuts through custom hook
  useKeyboardShortcuts();

  return <>{children}</>;
}
