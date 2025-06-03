"use client";

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

export default function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  useKeyboardShortcuts();

  return <>{children}</>;
}
