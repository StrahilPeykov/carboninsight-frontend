// Client-side component directive - required for hooks and browser-based tour logic
"use client";

// Custom hook that handles automatic tour triggering based on application state
// Manages tour initiation logic, user progress tracking, and conditional tour starts
import { useTourTrigger } from "@/hooks/useTourTrigger";

// TourTrigger component - invisible orchestrator for automatic tour initiation
// Implements the "headless component" pattern where logic runs without rendering UI
// Monitors application state and triggers appropriate tours based on user context
// Should be placed in layouts or pages where automatic tour detection is needed
export default function TourTrigger() {
  // Execute tour triggering logic through custom hook
  // Hook handles all tour detection, user state analysis, and automatic tour starts
  // Manages conditions like first-time visits, completion status, and route-based triggers
  useTourTrigger();
  
  // Return null for invisible operation - component provides behavior without UI
  // This pattern allows tour logic to run while keeping component tree clean
  // Tour triggering happens in the background without affecting page layout
  return null; // This component renders nothing, just triggers tours
}
