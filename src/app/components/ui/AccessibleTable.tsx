<<<<<<< HEAD
/**
 * AccessibleTable component provides a responsive table wrapper with proper accessibility features.
 * Includes horizontal scrolling support, screen reader captions, and semantic markup.
 * Used throughout the application for displaying tabular data in an accessible manner.
 */

// Interface defining the props for the AccessibleTable component
interface AccessibleTableProps {
  caption: string; // Screen reader caption describing the table content
  children: React.ReactNode; // Table content (thead, tbody, etc.)
  className?: string; // Optional additional CSS classes
}

/**
 * AccessibleTable component that wraps table content with accessibility features
 * @param caption - Descriptive text for screen readers about table content
 * @param children - Table elements to be rendered inside
 * @param className - Additional CSS classes to apply
 * @returns JSX element with accessible table wrapper
 */
=======
// Props interface for accessible table component with comprehensive WCAG 2.1 compliance
// Ensures proper semantic structure and screen reader compatibility for data tables
// Designed for responsive layouts with horizontal scrolling on mobile devices
interface AccessibleTableProps {
  caption: string;           // Required caption for table context and accessibility labeling
  children: React.ReactNode; // Table content including thead, tbody, and tr/td elements
  className?: string;        // Optional CSS classes for custom styling and layout adjustments
}

// Accessible table wrapper component with responsive design and ARIA compliance
// Provides horizontal scrolling, proper semantic markup, and screen reader support
// Implements WCAG 2.1 AA standards for data table accessibility and navigation
// Optimized for both desktop and mobile viewing with consistent scroll behavior
// Maintains table structure integrity while allowing flexible content composition
// Uses semantic HTML5 elements and ARIA attributes for assistive technology support
>>>>>>> main
export default function AccessibleTable({
  caption,
  children,
  className = "",
}: AccessibleTableProps) {
  return (
    <div className="w-full">
      {/* Scrollable container with proper ARIA region for large tables */}
      <div
        className="overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
        role="region" // ARIA role for scrollable content region
        aria-label={caption} // Accessible label describing table content
        style={{ maxWidth: "100vw" }} // Prevent overflow beyond viewport
      >
        {/* Main table element with responsive styling */}
        <table className={`min-w-full table-auto ${className}`} style={{ minWidth: "600px" }}>
          {/* Hidden caption for screen readers */}
          <caption className="sr-only">{caption}</caption>
          {children}
        </table>
      </div>
    </div>
  );
}
