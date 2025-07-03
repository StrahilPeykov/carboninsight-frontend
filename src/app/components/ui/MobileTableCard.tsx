// React imports for component functionality and state management
// ReactNode: Enables flexible content types for title, field values, and actions
// useState: Manages expansion state for field content visibility
import { ReactNode, useState } from "react";

// Props type definition for mobile table card component
// Designed for responsive table data display on small screens
// Supports expandable content, custom actions, and flexible field structures
type MobileTableCardProps = {
  title: ReactNode;                               // Card header content - can be text, elements, or components
  fields: { label: string; value: ReactNode }[]; // Array of label-value pairs for data display
  onClick?: () => void;                           // Optional click handler for custom card interactions
  actions?: ReactNode;                            // Optional action buttons or controls for the card
};

// Mobile-optimized table card component for responsive data display
// Provides alternative to traditional tables on small screens with better touch interaction
// Features expandable content, hover states, and action button integration
// Implements click handling with expansion fallback for improved mobile UX
export const MobileTableCard = ({ title, fields, onClick, actions }: MobileTableCardProps) => {
  // Expansion state for toggling field content visibility
  // Controls whether field values are truncated or fully displayed
  // Enables progressive disclosure for better mobile readability
  const [expanded, setExpanded] = useState(false);

  // Click handler with conditional behavior based on props
  // If onClick prop provided, executes custom handler for navigation or actions
  // Otherwise toggles expansion state for content visibility control
  // Provides flexible interaction patterns for different use cases
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
