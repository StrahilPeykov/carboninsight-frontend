import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorBannerProps {
  error: string;
  onClose?: () => void;
  autoFocus?: boolean;
}

export default function ErrorBanner({ error, onClose, autoFocus = false }: ErrorBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);

  // Auto-focus for critical errors
  useEffect(() => {
    if (autoFocus && bannerRef.current) {
      bannerRef.current.focus();
    }
  }, [autoFocus]);

  // Announce error to screen readers
  useEffect(() => {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "alert");
    announcement.setAttribute("aria-live", "assertive");
    announcement.className = "sr-only";
    announcement.textContent = `Error: ${error}`;
    document.body.appendChild(announcement);

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
      role="alert"
      aria-live="assertive"
      tabIndex={autoFocus ? -1 : undefined}
    >
      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1">
        <strong className="font-semibold">Error:</strong>
        <span className="ml-1">{error}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 p-1 rounded hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          aria-label="Dismiss error message"
        >
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
