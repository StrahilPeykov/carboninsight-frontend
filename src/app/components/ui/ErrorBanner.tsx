// React hooks for DOM references and side effect management
// useEffect: Handles accessibility features and screen reader announcements
// useRef: Provides direct DOM access for focus management and interaction
import { useEffect, useRef } from "react";
// Lucide React alert triangle icon for visual error indication
// Provides consistent iconography for error states across the application
import { AlertTriangle } from "lucide-react";

// Props interface for error banner component with accessibility and interaction options
// Designed for displaying critical error messages with proper ARIA support
// Supports optional dismissal and focus management for enhanced user experience
interface ErrorBannerProps {
  error: string;              // Error message text to display to users
  onClose?: () => void;       // Optional callback for dismissing the error banner
  autoFocus?: boolean;        // Whether to automatically focus the banner for critical errors
}

// Accessible error banner component with comprehensive WCAG 2.1 compliance
// Implements multiple accessibility features including screen reader announcements
// Supports automatic focus management for critical error scenarios
// Provides visual and programmatic error indication with proper ARIA attributes
// Features optional dismissal functionality and responsive design with dark mode support
export default function ErrorBanner({ error, onClose, autoFocus = false }: ErrorBannerProps) {
  // DOM reference for direct banner manipulation and focus management
  // Essential for implementing automatic focus on critical errors
  // Allows programmatic control of banner visibility and interaction
  const bannerRef = useRef<HTMLDivElement>(null);

  // Automatic focus effect for critical error scenarios
  // Immediately draws user attention to important error messages
  // Follows WCAG guidelines for focus management in error situations
  // Only triggers when autoFocus is enabled to prevent disruptive behavior
  useEffect(() => {
    if (autoFocus && bannerRef.current) {
      bannerRef.current.focus();
    }
  }, [autoFocus]);

  // Screen reader announcement system for immediate error communication
  // Creates temporary DOM element with assertive ARIA live region
  // Ensures error messages are announced immediately to assistive technologies
  // Implements proper cleanup to prevent memory leaks and DOM pollution
  useEffect(() => {
    // Create invisible announcement element for screen readers
    // Uses role="alert" for immediate, high-priority announcements
    // aria-live="assertive" interrupts current screen reader activity
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "alert");
    announcement.setAttribute("aria-live", "assertive");
    announcement.className = "sr-only";  // Screen reader only, visually hidden
    announcement.textContent = `Error: ${error}`;
    document.body.appendChild(announcement);

    // Cleanup function to remove announcement element when component unmounts
    // Prevents accumulation of hidden DOM elements and potential memory leaks
    // Ensures clean DOM state when error banner is removed or updated
    return () => {
      if (announcement.parentNode) {
        document.body.removeChild(announcement);
      }
    };
  }, [error]);

  return (
    // Main error banner container with comprehensive accessibility attributes
    // role="alert" identifies this as an important message requiring immediate attention
    // aria-live="assertive" ensures screen readers announce content changes immediately
    // tabIndex conditional allows focus when autoFocus is enabled for critical errors
    // Responsive design with red color scheme and dark mode compatibility
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
