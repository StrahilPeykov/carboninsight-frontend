"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-1 text-xs text-gray-500">Loading...</div>
    );
  }

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

  const handleThemeChange = (newTheme: typeof theme) => {
    setTheme(newTheme);

    // Announce to screen readers
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = `Theme changed to ${newTheme} mode`;
    document.body.appendChild(announcement);

    setTimeout(() => {
      if (announcement.parentNode) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  };

  return (
    <div
      className="flex items-center justify-between px-4 py-1"
      role="radiogroup"
      aria-label="Choose theme"
    >
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Theme:</span>
      <div className="flex gap-1">
        {themes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => handleThemeChange(value)}
            className={`p-1.5 rounded transition-colors ${
              theme === value
                ? "bg-red text-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-600"
            }`}
            role="radio"
            aria-checked={theme === value}
            aria-label={`${label} theme`}
            title={`Switch to ${label.toLowerCase()} theme`}
          >
            <Icon size={14} aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
