/**
 * TableRow component provides consistent styling and interaction states for table rows.
 * Supports edit mode, click handlers, and hover effects for better user experience.
 * Used in data tables throughout the application for uniform row appearance and behavior.
 */

import { ReactNode } from "react";

// Interface defining props for TableRow component
type TableRowProps = {
  children: ReactNode; // Table cell content (td elements)
  onClick?: () => void; // Optional click handler for row interaction
  editMode?: boolean; // Whether row is in edit mode (affects styling)
  className?: string; // Additional CSS classes for customization
};

/**
 * TableRow component for consistent table row styling and interaction
 * @param children - Table cell elements (td) to render within the row
 * @param onClick - Optional function called when row is clicked
 * @param editMode - Boolean indicating if row is in edit mode (changes visual state)
 * @param className - Additional CSS classes to apply to the row
 * @returns Styled table row with hover effects and optional click handling
 */
export const TableRow = ({
  children,
  onClick,
  editMode = false,
  className = "",
}: TableRowProps) => {
  // Base styling for all table rows with hover effects
  const baseClasses = "border-b hover:bg-gray-300 dark:hover:bg-gray-600 transition";
  
  // Conditional styling based on edit mode and click handler
  const modeClasses = editMode ? "cursor-pointer opacity-50 hover:opacity-100" : "cursor-default";

  return (
    <tr className={`${baseClasses} ${modeClasses} ${className}`} onClick={onClick}>
      {children}
    </tr>
  );
};
