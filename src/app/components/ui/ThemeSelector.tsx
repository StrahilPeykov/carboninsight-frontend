/**
 * ThemeSelector component allows users to switch between light, dark, and system themes.
 * Provides accessible radio group interface with proper ARIA attributes and announcements.
 * Integrates with ThemeContext to persist theme preferences across sessions.
 */

"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/**
 * ThemeSelector component for switching between application themes
 * @returns Radio group interface for theme selection with accessibility features
 */
export default function ThemeSelector() {
  const { theme, setTheme } = useTheme(); // Access theme context
  const [mounted, setMounted] = useState(false); // Track component mount state

  // Ensure component is mounted before rendering to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during SSR/hydration to prevent flash
  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-1 text-xs text-gray-500">Loading...</div>
    );
  }

  // Theme options with corresponding icons and labels
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

  /**
   * Handles theme change with accessibility announcements
   * @param newTheme - The selected theme value
   */
  const handleThemeChange = (newTheme: typeof theme) => {
    setTheme(newTheme); // Update theme in context

    // Announce theme change to screen readers
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = `Theme changed to ${newTheme} mode`;
    document.body.appendChild(announcement);

    // Clean up announcement after brief delay
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
