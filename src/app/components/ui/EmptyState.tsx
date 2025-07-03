<<<<<<< HEAD
/**
 * EmptyState component displays user-friendly messages when data is unavailable.
 * Provides visual feedback with optional icons, descriptions, and call-to-action buttons.
 * Used throughout the application to guide users when lists or content areas are empty.
 */

import { ReactNode } from "react";

// Interface defining the props for EmptyState component
interface EmptyStateProps {
  message: string; // Primary message describing the empty state
  icon?: ReactNode; // Optional icon to display above the message
  action?: {
    label: string; // Text for the action button
    onClick: () => void; // Function to execute when action is clicked
  };
  description?: string; // Optional longer description providing more context
}

/**
 * EmptyState component for displaying helpful messages when content is not available
 * @param message - Main heading text describing the empty state
 * @param icon - Optional icon element to display above the message
 * @param action - Optional action object with label and onClick handler
 * @param description - Optional descriptive text providing more context
 * @returns Centered empty state display with message, icon, and optional action
 */
export default function EmptyState({ message, icon, action, description }: EmptyStateProps) {
  return (
    // Container with proper ARIA attributes for screen readers
=======
// React ReactNode import for flexible icon and content handling
// Allows any valid React element to be passed as icon prop for maximum flexibility
import { ReactNode } from "react";

// Props interface for empty state component with optional action and visual elements
// Designed for displaying meaningful feedback when content is unavailable or loading
// Supports accessibility with proper ARIA attributes and semantic structure
interface EmptyStateProps {
  message: string;              // Primary message displayed as heading for user context
  icon?: ReactNode;             // Optional icon element for visual enhancement and context
  action?: {                    // Optional call-to-action with callback functionality
    label: string;              // Button text for the action
    onClick: () => void;        // Click handler for user interaction
  };
  description?: string;         // Optional secondary description for additional context
}

// Empty state component for displaying helpful messages when content is unavailable
// Implements accessibility best practices with proper ARIA attributes and semantic HTML
// Provides consistent styling and layout for empty content scenarios across the application
// Supports optional icons, descriptions, and call-to-action buttons for enhanced UX
// Follows responsive design principles with proper spacing and typography hierarchy
export default function EmptyState({ message, icon, action, description }: EmptyStateProps) {
  return (
    // Main container with centered layout and accessibility attributes
    // role="status" announces content changes to screen readers
    // aria-live="polite" ensures updates are announced without interrupting user flow
    // Generous padding provides comfortable whitespace for reading and visual balance
>>>>>>> main
    <div className="text-center py-12 px-4" role="status" aria-live="polite">
      {/* Optional icon section */}
      {icon && (
        <div className="mb-4 flex justify-center" aria-hidden="true">
          {icon}
        </div>
      )}

      {/* Main message heading */}
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{message}</h3>

      {/* Optional description text */}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          {description}
        </p>
      )}

      {/* Optional call-to-action button */}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red min-h-[44px]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
