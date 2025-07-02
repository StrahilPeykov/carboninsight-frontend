"use client";

// React imports for context and state management
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Type definition for theme options
// Supports light, dark, and system (auto-detect based on OS preference)
type Theme = "light" | "dark" | "system";

/**
 * Interface defining the theme context shape
 * Provides theme state and control methods to consuming components
 */
interface ThemeContextType {
  theme: Theme; // Current theme setting (light/dark/system)
  setTheme: (theme: Theme) => void; // Method to change theme preference
  effectiveTheme: "light" | "dark"; // The actual theme being applied (resolved from system if needed)
}

// Create theme context with undefined default to enforce provider usage
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider component that manages application theme state
 * Handles theme persistence, system preference detection, and DOM updates
 * 
 * @param children - React components to be wrapped with theme context
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Current theme preference (light/dark/system)
  const [theme, setTheme] = useState<Theme>("system");
  
  // The actual theme being applied (always light or dark, never system)
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">("light");
  
  // Flag to track if component has mounted (prevents SSR hydration issues)
  const [mounted, setMounted] = useState(false);

  /**
   * Effect to handle component mounting and load saved theme preference
   * Prevents hydration mismatches by only running on client side
   */
  useEffect(() => {
    setMounted(true); // Mark component as mounted

    // Load theme from localStorage or default to system preference
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      setTheme(savedTheme); // Apply saved theme if valid
    }
  }, []);

  /**
   * Effect to update effective theme when theme changes or system preference changes
   * Resolves 'system' theme to actual light/dark based on OS preference
   */
  useEffect(() => {
    // Only run on client side after component has mounted
    if (!mounted) return;

    /**
     * Function to determine and apply the effective theme
     * Resolves system preference and updates DOM classes
     */
    const updateEffectiveTheme = () => {
      let newEffectiveTheme: "light" | "dark";

      if (theme === "system") {
        // Use system preference when theme is set to 'system'
        newEffectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      } else {
        // Use explicit theme selection
        newEffectiveTheme = theme;
      }

      // Update state with resolved theme
      setEffectiveTheme(newEffectiveTheme);

      // Apply theme to document root for CSS styling
      const root = document.documentElement;
      root.classList.remove("light", "dark"); // Remove existing theme classes
      root.classList.add(newEffectiveTheme); // Add new theme class
    };

    // Update theme immediately
    updateEffectiveTheme();

    // Listen for system theme changes to update when user changes OS preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    /**
     * Handler for system theme preference changes
     * Only updates if current theme is set to 'system'
     */
    const handleChange = () => {
      if (theme === "system") {
        updateEffectiveTheme(); // Re-evaluate system preference
      }
    };

    // Add event listener for system preference changes
    mediaQuery.addEventListener("change", handleChange);
    
    // Cleanup event listener on effect cleanup
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]); // Re-run when theme or mount status changes

  /**
   * Effect to save theme preference to localStorage
   * Persists user's theme choice across browser sessions
   */
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("theme", theme); // Save current theme to localStorage
    }
  }, [theme, mounted]); // Save whenever theme changes after mounting

  // Create context value with current state and theme setter
  const value = {
    theme,
    setTheme,
    effectiveTheme,
  };

  // Provide theme context to all child components
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Custom hook to access theme context
 * Provides theme state and controls with error handling
 * 
 * @returns Theme context object with state and methods
 * @throws Error if used outside of ThemeProvider
 */
export function useTheme() {
  // Attempt to access theme context
  const context = useContext(ThemeContext);
  
  // Ensure hook is used within ThemeProvider
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
}
