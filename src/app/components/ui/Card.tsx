/**
 * Card component provides a consistent container with elevation and proper semantic structure.
 * Supports customizable headings, ARIA attributes, and different semantic HTML elements.
 * Used throughout the application for grouping related content with visual separation.
 */

import { ReactNode, createElement, HTMLAttributes } from "react";

// Interface extending div attributes with card-specific props
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode; // Card content
  title?: string; // Optional card title/heading
  className?: string; // Additional CSS classes
  as?: "div" | "section" | "article"; // Semantic HTML element to render
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6; // Heading level for title
  role?: string; // Custom ARIA role
  ariaLabel?: string; // Accessible label for the card
  ariaLabelledBy?: string; // ID of element that labels this card
}

/**
 * Flexible Card component with semantic HTML and accessibility features
 * @param children - Content to display inside the card
 * @param title - Optional title text displayed in card header
 * @param className - Additional CSS classes for customization
 * @param as - HTML element type (div, section, article) for semantic markup
 * @param headingLevel - Heading level (1-6) for the title when provided
 * @param role - Custom ARIA role for accessibility
 * @param ariaLabel - Accessible label describing the card's purpose
 * @param ariaLabelledBy - ID of element that provides the card's label
 * @returns Styled card container with optional header and proper semantics
 */
export default function Card({
  children,
  title,
  className = "",
  as: Component = "div", // Default to div element
  headingLevel = 3, // Default to h3 for most card titles
  role,
  ariaLabel,
  ariaLabelledBy,
}: CardProps) {
  // Generate unique ID for title to link with aria-labelledby
  const titleId = title ? `card-title-${title.replace(/\s+/g, "-").toLowerCase()}` : undefined;

  // Base styling for consistent card appearance
  const baseClasses = `bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${className}`;

  // Determine appropriate ARIA attributes for accessibility
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
