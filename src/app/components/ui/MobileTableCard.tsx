/**
 * MobileTableCard component displays table data in card format for mobile devices.
 * Provides expandable content, action buttons, and responsive design for better mobile UX.
 * Used as an alternative to data tables on smaller screens where horizontal scrolling is problematic.
 */

import { ReactNode, useState } from "react";

// Interface defining props for the mobile table card component
type MobileTableCardProps = {
  title: ReactNode; // Main title/header content for the card
  fields: { label: string; value: ReactNode }[]; // Array of field data to display
  onClick?: () => void; // Optional click handler for the entire card
  actions?: ReactNode; // Optional action buttons (edit, delete, etc.)
};

/**
 * MobileTableCard component for displaying table row data in card format on mobile
 * @param title - Primary content displayed as the card header
 * @param fields - Array of label-value pairs representing table columns
 * @param onClick - Optional function called when card is clicked (for navigation)
 * @param actions - Optional action buttons displayed at the bottom of the card
 * @returns Card-style representation of table row data optimized for mobile viewing
 */
export const MobileTableCard = ({ title, fields, onClick, actions }: MobileTableCardProps) => {
  // State to control content expansion/collapse
  const [expanded, setExpanded] = useState(false);

  /**
   * Handles card click events - either executes custom onClick or toggles expansion
   */
  const handleClick = () => {
    if (onClick) {
      onClick(); // Execute custom click handler if provided
    } else {
      setExpanded(!expanded); // Toggle content expansion by default
    }
  };

  return (
    <div
      className="border rounded-md p-4 shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      onClick={handleClick} // Make entire card clickable
    >
      {/* Card header with title content */}
      <div className="mb-2 font-semibold text-gray-900 dark:text-gray-100">{title}</div>

      {/* Field data with conditional truncation based on expansion state */}
      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
        {fields.map((field, idx) => (
          <p key={idx} className={expanded ? "" : "truncate"}>
            <span className="font-medium">{field.label}: </span>
            {field.value}
          </p>
        ))}
      </div>

      {/* Action buttons section - prevents event bubbling to card click */}
      {actions && (
        <div className="mt-4 flex justify-end" onClick={e => e.stopPropagation()}>
          {actions}
        </div>
      )}
    </div>
  );
};
