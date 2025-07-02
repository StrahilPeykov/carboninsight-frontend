/**
 * PopupModal component provides a flexible modal dialog with confirmation features.
 * Supports type-to-confirm functionality, custom actions, accessibility features,
 * and proper focus management. Used for confirmations, alerts, and user interactions.
 */

"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import Button from "./Button";

// Interface defining props for PopupModal component
interface PopupModalProps {
  title: string; // Modal title displayed in header
  confirmationRequiredText?: string; // Text user must type to enable confirmation
  confirmLabel?: string; // Label for confirm button
  onConfirm?: () => void; // Callback for confirm action
  onClose: () => void; // Callback for closing modal
  showCancel?: boolean; // Whether to show cancel button
  children: ReactNode; // Modal content body
}

/**
 * PopupModal component for confirmations and user interactions
 * @param title - Text displayed in the modal header
 * @param confirmationRequiredText - Optional text user must type to confirm dangerous actions
 * @param confirmLabel - Custom text for the confirm button (default: "Confirm")
 * @param onConfirm - Function called when user confirms the action
 * @param onClose - Function called when modal should be closed
 * @param showCancel - Whether to display the cancel button (default: true)
 * @param children - Content displayed in the modal body
 * @returns Modal dialog with confirmation functionality and accessibility features
 */
export default function PopupModal({
  title,
  confirmationRequiredText = "",
  confirmLabel = "Confirm",
  onConfirm,
  onClose,
  showCancel = true,
  children,
}: PopupModalProps) {
  // References for focus management and accessibility
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).substr(2, 9)}`);

  // State for type-to-confirm functionality
  const [inputValue, setInputValue] = useState("");
  
  // Validation: confirm button enabled when no confirmation text required OR input matches exactly
  const isMatch = confirmationRequiredText ? inputValue === confirmationRequiredText : true;

  // Focus management and body scroll lock setup
  useEffect(() => {
    // Store previously focused element for restoration
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Lock body scroll to prevent background interaction
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Hide main content from screen readers while modal is open
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.setAttribute("aria-hidden", "true");
    }

    // Focus the modal container for keyboard navigation
    modalRef.current?.focus();

    // Announce modal opening to screen readers
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = `${title} dialog opened`;
    document.body.appendChild(announcement);

    // Cleanup function
    return () => {
      // Restore body scroll
      document.body.style.overflow = origOverflow;

      // Remove aria-hidden from main content
      if (mainContent) {
        mainContent.removeAttribute("aria-hidden");
      }

      // Remove announcement element
      if (announcement.parentNode) {
        document.body.removeChild(announcement);
      }

      // Return focus to previously focused element
      previousActiveElement.current?.focus();
    };
  }, [title]);

  // Keyboard interaction handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close modal on Escape key
      if (e.key === "Escape") {
        onClose();
      }

      // Implement focus trap for accessibility compliance
      if (e.key === "Tab") {
        const focusableElements = modalRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          // Handle shift+tab on first element
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } 
          // Handle tab on last element
          else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

return ReactDOM.createPortal(
  <>
    {/* Modal backdrop for overlay effect */}
    <div
      className="fixed inset-0 bg-black/50 z-55"
      onClick={onClose}
      aria-hidden="true"
    />

    {/* Modal container with proper positioning and overflow handling */}
    <div
      className="fixed inset-0 z-100 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId.current}
      aria-describedby="modal-description"
    >
      <div className="flex min-h-full items-center justify-center px-4 py-8">
        <div
          ref={modalRef}
          className="relative inline-block w-full max-w-xl p-6 bg-white dark:bg-gray-800 shadow-xl rounded-lg"
          tabIndex={-1}
        >
          {/* Modal header with title and close button */}
          <header className="flex justify-between items-center mb-4">
            <h2
              id={titleId.current}
              className="text-xl font-semibold text-gray-900 dark:text-gray-100"
            >
              {title}
            </h2>
            <Button
              variant="icon"
              onClick={onClose}
              ariaLabel="Close dialog"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 -m-2"
            >
              {/* Close icon with proper accessibility */}
              <svg
                className="w-6 h-6"
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
            </Button>
          </header>

          {/* Modal body content */}
          <div id="modal-description" className="mb-4 text-gray-700 dark:text-gray-300">
            {children}
          </div>

          {/* Type-to-confirm input section for dangerous actions */}
          {confirmationRequiredText && (
            <div className="mb-4">
              <label
                htmlFor="confirmation-input"
                className="block text-sm text-gray-600 dark:text-gray-400 mb-2"
              >
                To confirm, type{" "}
                <strong className="text-gray-900 dark:text-gray-100">
                  {confirmationRequiredText}
                </strong>{" "}
                below:
              </label>
              <input
                id="confirmation-input"
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="mt-2 w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
                aria-describedby="confirmation-help"
                aria-invalid={inputValue.length > 0 && !isMatch}
              />
              {/* Validation feedback for confirmation input */}
              {inputValue.length > 0 && !isMatch && (
                <p
                  id="confirmation-help"
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  Text doesn't match. Please type exactly: {confirmationRequiredText}
                </p>
              )}
            </div>
          )}

          {/* Modal footer with action buttons */}
          {(onConfirm || confirmationRequiredText) && (
            <footer className="flex justify-end space-x-2 mt-4">
              {/* Cancel button (optional) */}
              {showCancel && (
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
              {/* Confirm button with validation */}
              <Button
                onClick={onConfirm}
                disabled={!isMatch}
                className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                ariaLabel={`${confirmLabel} ${confirmationRequiredText ? confirmationRequiredText : ""}`}
              >
                {confirmLabel}
              </Button>
            </footer>
          )}
        </div>
      </div>
    </div>
  </>,
  document.body
);
}
