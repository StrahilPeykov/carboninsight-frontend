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
