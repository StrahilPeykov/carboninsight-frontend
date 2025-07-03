<<<<<<< HEAD
/**
 * TableRow component provides consistent styling and interaction states for table rows.
 * Supports edit mode, click handlers, and hover effects for better user experience.
 * Used in data tables throughout the application for uniform row appearance and behavior.
 */

import { ReactNode } from "react";

// Interface defining props for TableRow component
=======
// React ReactNode import for flexible content types
// Enables table row to contain any valid React elements including cells and content
import { ReactNode } from "react";

// Props interface for table row component with interaction and styling options
// Supports click handling, edit mode states, and custom styling
>>>>>>> main
type TableRowProps = {
  children: ReactNode; // Table cell content (td elements)
  onClick?: () => void; // Optional click handler for row interaction
  editMode?: boolean; // Whether row is in edit mode (affects styling)
  className?: string; // Additional CSS classes for customization
};

<<<<<<< HEAD
/**
 * TableRow component for consistent table row styling and interaction
 * @param children - Table cell elements (td) to render within the row
 * @param onClick - Optional function called when row is clicked
 * @param editMode - Boolean indicating if row is in edit mode (changes visual state)
 * @param className - Additional CSS classes to apply to the row
 * @returns Styled table row with hover effects and optional click handling
 */
=======
// Enhanced table row component with hover effects and interactive states
// Provides consistent styling and behavior across all table implementations
// Supports both static display and interactive editing modes
>>>>>>> main
export const TableRow = ({
  children,
  onClick,
  editMode = false,
  className = "",
}: TableRowProps) => {
<<<<<<< HEAD
  // Base styling for all table rows with hover effects
  const baseClasses = "border-b hover:bg-gray-300 dark:hover:bg-gray-600 transition";
  
  // Conditional styling based on edit mode and click handler
=======
  // Base styling classes for consistent table row appearance
  // Includes border, hover effects, and smooth transitions for professional look
  const baseClasses = "border-b hover:bg-gray-300 dark:hover:bg-gray-600 transition";
  
  // Mode-specific styling based on edit state and interactivity
  // Edit mode: Provides visual feedback with opacity changes and pointer cursor
  // Default mode: Uses default cursor for non-interactive rows
>>>>>>> main
  const modeClasses = editMode ? "cursor-pointer opacity-50 hover:opacity-100" : "cursor-default";

  return (
    // Table row element with combined styling classes and optional click handling
    // Merges base styles, mode-specific styles, and custom className
    // onClick is optional to support both interactive and static rows
    <tr className={`${baseClasses} ${modeClasses} ${className}`} onClick={onClick}>
      {children}
    </tr>
  );
};
