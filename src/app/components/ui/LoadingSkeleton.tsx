<<<<<<< HEAD
/**
 * LoadingSkeleton component provides visual feedback during data loading states.
 * Displays an animated spinner with accessible text for screen readers.
 * Used throughout the application to indicate ongoing operations and improve perceived performance.
 */

/**
 * Simple loading skeleton component with accessibility features
 * @returns Centered loading indicator with spinner animation and screen reader text
 */
=======
// Loading skeleton component with accessible spinner and proper ARIA attributes
// Provides visual feedback during async operations with screen reader support
// Features responsive design with consistent styling and animation patterns

>>>>>>> main
export default function LoadingSkeleton() {
  return (
    // Container with proper ARIA attributes for loading states
    <div
      className="flex items-center justify-center min-h-[200px]"
      role="status" // ARIA role indicating this is a status update
      aria-live="polite" // Announces loading state changes to screen readers
    >
      <div className="text-center">
        {/* Animated spinner with brand colors */}
        <div
          className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red"
          aria-hidden="true" // Hidden from screen readers since text provides context
        ></div>
        {/* Loading text for screen readers and visual users */}
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
