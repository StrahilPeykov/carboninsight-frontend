/**
 * ErrorBanner component displays error messages with proper accessibility features.
 * Announces errors to screen readers, supports auto-focus for critical errors,
 * and provides dismissible UI for better user experience.
 */

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

// Interface defining props for ErrorBanner component
interface ErrorBannerProps {
  error: string; // Error message text to display
  onClose?: () => void; // Optional callback for dismissing the error
  autoFocus?: boolean; // Whether to auto-focus banner for critical errors
}

/**
 * ErrorBanner component for displaying error messages with accessibility support
 * @param error - Error message text to be displayed to the user
 * @param onClose - Optional function called when user dismisses the error
 * @param autoFocus - If true, automatically focuses the banner for critical errors
 * @returns Error banner with proper ARIA attributes and dismissible functionality
 */
export default function ErrorBanner({ error, onClose, autoFocus = false }: ErrorBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);

  // Auto-focus banner for critical errors to ensure visibility
  useEffect(() => {
    if (autoFocus && bannerRef.current) {
      bannerRef.current.focus();
    }
  }, [autoFocus]);

  // Announce error to screen readers using live region
  useEffect(() => {
    // Create temporary announcement element for screen readers
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "alert"); // Immediate announcement
    announcement.setAttribute("aria-live", "assertive"); // High priority
    announcement.className = "sr-only"; // Hidden from visual users
    announcement.textContent = `Error: ${error}`;
    document.body.appendChild(announcement);

    // Clean up announcement element after brief delay
    return () => {
      if (announcement.parentNode) {
        document.body.removeChild(announcement);
      }
    };
  }, [error]);

  return (
    <div
      ref={bannerRef}
      className="bg-red-100 text-red-700 border border-red-300 rounded-md p-4 flex items-start gap-3 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
      role="alert" // ARIA role for error announcements
      aria-live="assertive" // High priority live region
      tabIndex={autoFocus ? -1 : undefined} // Allow focus for critical errors
    >
      {/* Warning icon for visual emphasis */}
      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
      
      {/* Error message content */}
      <div className="flex-1">
        <strong className="font-semibold">Error:</strong>
        <span className="ml-1">{error}</span>
      </div>
      
      {/* Optional close button for dismissible errors */}
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 p-1 rounded hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          aria-label="Dismiss error message"
        >
          {/* Close icon with proper accessibility */}
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
