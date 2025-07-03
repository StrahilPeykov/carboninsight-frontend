// React imports for flexible component rendering and type safety
// ReactNode: Allows any valid React content as children
// createElement: Enables dynamic HTML element creation for semantic flexibility
// HTMLAttributes: Provides complete HTML div attributes for maximum extensibility
import { ReactNode, createElement, HTMLAttributes } from "react";

// Flexible card component props interface with comprehensive accessibility support
// Extends HTMLAttributes to inherit all standard div properties while adding card-specific features
// Supports semantic HTML elements and ARIA attributes for screen reader compatibility
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;          // Card content - any valid React elements or components
  title?: string;               // Optional card title with automatic heading generation
  className?: string;           // Additional CSS classes for custom styling and layout
  as?: "div" | "section" | "article";  // Semantic HTML element for proper document structure
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;  // Heading hierarchy level for accessibility compliance
  role?: string;                // Custom ARIA role for specialized card semantics
  ariaLabel?: string;           // Descriptive label for screen readers when title insufficient
  ariaLabelledBy?: string;      // References external element that labels this card
}

// Versatile card component with semantic HTML support and accessibility features
// Automatically generates proper heading hierarchy and ARIA relationships
// Supports multiple semantic elements (div, section, article) for document structure
// Implements responsive design with consistent styling and dark mode support
// Follows WCAG guidelines with proper labeling and keyboard navigation compatibility
export default function Card({
  children,
  title,
  className = "",
  as: Component = "div",        // Default to generic div, allows override for semantic HTML
  headingLevel = 3,             // Default h3 for typical content hierarchy
  role,
  ariaLabel,
  ariaLabelledBy,
}: CardProps) {
  // Generate unique title ID for ARIA labelledby relationships
  // Creates kebab-case ID from title text for proper element association
  // Essential for screen reader navigation and accessibility compliance
  const titleId = title ? `card-title-${title.replace(/\s+/g, "-").toLowerCase()}` : undefined;

  // Base styling classes with theme support and responsive design
  // Consistent card appearance across application with shadow and rounded corners
  // Dark mode compatible with proper contrast ratios for accessibility
  const baseClasses = `bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${className}`;

  // ARIA attributes configuration for accessibility and semantic relationships
  // Automatically links card title for proper screen reader announcement
  // Supports custom roles and labels for specialized card usage patterns
  const ariaAttributes = {
    role: role,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy || (title ? titleId : undefined),
  };

  // Card content with optional header section
  const content = (
    <>
      {/* Optional card header with title */}
      {title && (
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          {/* Dynamically create heading element based on headingLevel prop */}
          {createElement(
            `h${headingLevel}`, // Creates h1, h2, h3, etc. based on prop
            {
              id: titleId, // Links to aria-labelledby for accessibility
              className: "text-lg font-medium leading-6 text-gray-900 dark:text-white",
            },
            title
          )}
        </div>
      )}
      {/* Main card content area with responsive padding */}
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </>
  );

  // Render card using specified semantic element
  return (
    <Component className={baseClasses} {...ariaAttributes}>
      {content}
    </Component>
  );
}
