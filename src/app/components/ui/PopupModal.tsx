"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import Button from "./Button";

interface PopupModalProps {
  title: string;
  confirmationRequiredText?: string;
  confirmLabel?: string;
  onConfirm?: () => void;
  onClose: () => void;
  showCancel?: boolean;
  children: ReactNode;
}

export default function PopupModal({
  title,
  confirmationRequiredText = "",
  confirmLabel = "Confirm",
  onConfirm,
  onClose,
  showCancel = true,
  children,
}: PopupModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).substr(2, 9)}`);

  // Local state for the "type-to-confirm" input
  const [inputValue, setInputValue] = useState("");
  // Only enable confirm when (a) no text required or (b) input matches exactly
  const isMatch = confirmationRequiredText ? inputValue === confirmationRequiredText : true;

  // Focus management and body scroll lock
  useEffect(() => {
    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Lock body scroll
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Add aria-hidden to main content
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.setAttribute("aria-hidden", "true");
    }

    // Focus the modal
    modalRef.current?.focus();

    // Announce modal opening to screen readers
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = `${title} dialog opened`;
    document.body.appendChild(announcement);

    return () => {
      // Restore body scroll
      document.body.style.overflow = origOverflow;

      // Remove aria-hidden from main content
      if (mainContent) {
        mainContent.removeAttribute("aria-hidden");
      }

      // Remove announcement
      if (announcement.parentNode) {
        document.body.removeChild(announcement);
      }

      // Return focus to previously focused element
      previousActiveElement.current?.focus();
    };
  }, [title]);

  // Handle keyboard interactions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      // Focus trap
      if (e.key === "Tab") {
        const focusableElements = modalRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId.current}
        aria-describedby="modal-description"
      >
        <div
          ref={modalRef}
          className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 relative"
          tabIndex={-1}
        >
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

          <div id="modal-description" className="mb-4 text-gray-700 dark:text-gray-300">
            {children}
          </div>

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

          {(onConfirm || confirmationRequiredText) && (
            <footer className="flex justify-end space-x-2 mt-4">
              {showCancel && (
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
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
    </>,
    document.body
  );
}
