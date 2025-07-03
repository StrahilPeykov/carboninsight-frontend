<<<<<<< HEAD
/**
 * ThemeSelector component allows users to switch between light, dark, and system themes.
 * Provides accessible radio group interface with proper ARIA attributes and announcements.
 * Integrates with ThemeContext to persist theme preferences across sessions.
 */

=======
// Client-side component directive for Next.js App Router
// Required for components using React hooks and browser APIs
>>>>>>> main
"use client";

// React hooks for state management and lifecycle effects
// useState: Manages component mount state to prevent hydration mismatch
// useEffect: Handles client-side mounting for SSR compatibility
import { useState, useEffect } from "react";
// Lucide React icons for theme selection visual indicators
// Sun: Light theme icon, Moon: Dark theme icon, Monitor: System theme icon
import { Sun, Moon, Monitor } from "lucide-react";
// Custom theme context hook for global theme state management
// Provides theme value and setter function for application-wide theme control
import { useTheme } from "../../context/ThemeContext";

<<<<<<< HEAD
/**
 * ThemeSelector component for switching between application themes
 * @returns Radio group interface for theme selection with accessibility features
 */
export default function ThemeSelector() {
  const { theme, setTheme } = useTheme(); // Access theme context
  const [mounted, setMounted] = useState(false); // Track component mount state

  // Ensure component is mounted before rendering to prevent hydration issues
=======
// Theme selector component with accessibility features and screen reader support
// Implements radio group pattern for mutually exclusive theme selection
// Prevents hydration mismatch by waiting for client-side mount
// Features smooth transitions and visual feedback for theme changes
export default function ThemeSelector() {
  // Theme context hook providing current theme state and setter function
  // Connects to global theme management system for consistent application theming
  const { theme, setTheme } = useTheme();
  
  // Mount state to prevent hydration mismatch between server and client
  // Ensures component only renders interactive elements after client-side hydration
  // Critical for SSR compatibility and preventing React hydration errors
  const [mounted, setMounted] = useState(false);

  // Effect to set mounted state after component hydration
  // Runs once on mount to indicate client-side rendering is complete
  // Enables safe rendering of theme-dependent content
>>>>>>> main
  useEffect(() => {
    setMounted(true);
  }, []);

<<<<<<< HEAD
  // Show loading state during SSR/hydration to prevent flash
=======
  // Loading state display during server-side rendering and initial hydration
  // Prevents layout shift and hydration mismatch errors
  // Shows minimal loading indicator while component initializes
>>>>>>> main
  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-1 text-xs text-gray-500">Loading...</div>
    );
  }

<<<<<<< HEAD
  // Theme options with corresponding icons and labels
=======
  // Theme configuration array with metadata for each available theme option
  // Each theme includes value for state management, label for accessibility, and icon for visual representation
  // Structured for easy iteration and consistent UI rendering
>>>>>>> main
  const themes = [
    {
      value: "light" as const,
      label: "Light",
      icon: Sun,
    },
    {
      value: "dark" as const,
      label: "Dark",
      icon: Moon,
    },
    {
      value: "system" as const,
      label: "System",
      icon: Monitor,
    },
  ];

<<<<<<< HEAD
  /**
   * Handles theme change with accessibility announcements
   * @param newTheme - The selected theme value
   */
  const handleThemeChange = (newTheme: typeof theme) => {
    setTheme(newTheme); // Update theme in context

    // Announce theme change to screen readers
=======
  // Theme change handler with accessibility announcements
  // Updates global theme state and notifies screen readers of the change
  // Implements temporary DOM announcement for immediate accessibility feedback
  const handleThemeChange = (newTheme: typeof theme) => {
    // Update global theme state through context
    setTheme(newTheme);

    // Create screen reader announcement for theme change
    // Uses ARIA live region for immediate accessibility feedback
    // Temporary element ensures announcement without visual interference
>>>>>>> main
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = `Theme changed to ${newTheme} mode`;
    document.body.appendChild(announcement);

<<<<<<< HEAD
    // Clean up announcement after brief delay
=======
    // Clean up announcement element after screen readers have processed it
    // Prevents DOM pollution while ensuring accessibility announcement is heard
>>>>>>> main
    setTimeout(() => {
      if (announcement.parentNode) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  };

  return (
    <div
      className="flex items-center justify-between px-4 py-1"
      role="radiogroup" // ARIA role for theme selection group
      aria-label="Choose theme" // Accessible label for the control group
    >
      {/* Label for the theme selector */}
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Theme:</span>
      
      {/* Theme option buttons */}
      <div className="flex gap-1">
        {themes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => handleThemeChange(value)}
            className={`p-1.5 rounded transition-colors ${
              theme === value
                ? "bg-red text-white" // Active state styling
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-600"
            }`}
            role="radio" // ARIA role for individual theme option
            aria-checked={theme === value} // Indicates current selection
            aria-label={`${label} theme`} // Accessible label for each option
            title={`Switch to ${label.toLowerCase()} theme`} // Tooltip text
          >
            {/* Theme icon with proper accessibility hiding */}
            <Icon size={14} aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
