// React core imports for component functionality and type definitions
// React: Required for JSX and component creation
// ReactNode: Enables flexible content types for custom cell rendering
// useState: Manages pagination state for table navigation
import React, { ReactNode, useState } from "react";
// Custom button component with accessibility features and consistent styling
// Used for pagination controls with proper disabled states and interactions
import Button from "./Button";
// Mobile-optimized card component for responsive table display on small screens
// Provides touch-friendly alternative to traditional table layout
import { MobileTableCard } from "./MobileTableCard";
// Custom table row component with enhanced styling and interaction capabilities
// Provides consistent row appearance and hover states across table implementations
import { TableRow } from "./tableRow";

// Generic column interface for flexible table configuration
// Supports type-safe column definitions with custom rendering capabilities
// Enables both property-based and computed column content
export interface Column<T> {
  key: keyof T | string; // Property key from data object or "actions" for action buttons
  label: string; // Column header text
  render?: (value: unknown, row: T) => ReactNode; // Custom rendering function for cell content
}

// Interface defining props for OurTable component
interface OurTableProps<T> {
  title?: string; // Optional table title
  description?: string; // Optional table description
  caption: string; // Screen reader caption describing table purpose
  cardTitle?: string; // Prefix for mobile card titles
  items: T[]; // Array of data items to display
  columns: Column<T>[]; // Column configuration array
}

// Generic responsive table component with built-in pagination and dual-layout support
// Automatically switches between desktop table and mobile cards based on screen size
// Implements accessibility best practices with proper ARIA labels and semantic HTML
// Features type-safe column configuration and flexible content rendering
// Supports custom cell rendering for complex data types and interactive elements
export function OurTable<T>({
  title,
  description,
  caption,
  cardTitle,
  items,
  columns,
}: OurTableProps<T>) {
  // Current page state for pagination functionality
  // Starts at page 1 and controls which subset of data is displayed
  // Enables navigation through large datasets without performance impact
  const [currentPage, setCurrentPage] = useState(1);
  
  // Items per page configuration for pagination performance optimization
  // Fixed at 10 items to balance data visibility with loading performance
  // Prevents DOM complexity issues with large datasets
  const itemsPerPage = 10;

  // Pagination calculations for efficient data slicing and navigation
  // Computes current page boundaries and total page count dynamically
  // Ensures proper pagination behavior regardless of data size
  const startIndex = (currentPage - 1) * itemsPerPage;   // Starting index for current page slice
  const endIndex = startIndex + itemsPerPage;           // Ending index for current page slice
  const paginatedItems = items.slice(startIndex, endIndex); // Current page data subset
  const totalPages = Math.ceil(items.length / itemsPerPage); // Total pages needed for all data

  // Type guard function for safe property access on generic data objects
  // Ensures type safety when accessing dynamic properties from unknown object types
  // Prevents runtime errors from undefined property access
  // Returns true if the key exists as a property on the item object
  function isKnownKey<T>(item: T, key: string): key is Extract<keyof T, string> {
    return Object.prototype.hasOwnProperty.call(item, key);
  }

  return (
    <div className="min-w-full">
      {/* Optional table header section */}
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      {description && <h3 className="text-md mb-4 dark:text-gray-400"> {description} </h3>}

      {/* Conditional rendering based on data availability */}
      {paginatedItems.length > 0 ? (
        <>
          {/* Desktop Table View - Hidden on mobile devices */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              {/* Screen reader caption for accessibility */}
              <caption className="sr-only">{caption}</caption>
              
              {/* Table header with column definitions */}
              <thead className="border-b font-bold text-md">
                <tr>
                  {columns.map(({ key, label }, idx) => {
                    // Right-align action columns, left-align data columns
                    const alignmentClass = key === "actions" ? "text-right" : "text-left";
                    return (
                      <th key={idx} className={`p-2 ${alignmentClass}`}>
                        {label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              
              {/* Table body with data rows */}
              <tbody className="text-sm">
                {paginatedItems.map((item, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map(({ key, render }, colIndex) => {
                      // Extract cell value from data object
                      let value: unknown = undefined;

                      // Get value from data object if key exists (excluding special "actions" key)
                      if (key !== "actions" && typeof key === "string" && isKnownKey(item, key)) {
                        value = item[key];
                      }

                      // Apply same alignment as header
                      const alignmentClass = key === "actions" ? "text-right" : "text-left";

                      return (
                        <td key={colIndex} className={`p-2 ${alignmentClass}`}>
                          {/* Use custom render function or display raw value */}
                          {render ? render(value, item) : String(value ?? "")}
                        </td>
                      );
                    })}
                  </TableRow>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View - Displayed only on mobile devices */}
          <div className="md:hidden space-y-2">
            {paginatedItems.map((item, rowIndex) => {
              // Prepare field data for mobile cards (excluding actions)
              const fields = columns
                .filter(col => col.key !== "actions")
                .map(col => {
                  // Extract value from data object
                  let rawValue: unknown = undefined;

                  if (typeof col.key === "string" && isKnownKey(item, col.key)) {
                    rawValue = item[col.key];
                  }

                  // Apply custom rendering if provided
                  const rendered = col.render ? col.render(rawValue, item) : rawValue;

                  return {
                    label: col.label,
                    value: rendered as ReactNode,
                  };
                });

              return (
                <MobileTableCard
                  key={rowIndex}
                  // Use custom card title or first field value as title
                  title={cardTitle ? cardTitle + (rowIndex + 1) : fields[0].value}
                  // Show all fields or skip first if used as title
                  fields={cardTitle ? fields : fields.slice(1)}
                  // Extract action buttons from actions column
                  actions={columns.find(col => col.key === "actions")?.render?.(undefined, item)}
                />
              );
            })}
          </div>

          {/* Pagination Controls */}
          <nav className="flex justify-between items-center mt-4" aria-label="Pagination">
            <div className="flex items-center gap-2">
              {/* Previous page button */}
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="hover:cursor-pointer"
              >
                Previous
              </Button>
              
              {/* Current page indicator */}
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              
              {/* Next page button */}
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="hover:cursor-pointer"
              >
                Next
              </Button>
            </div>
          </nav>
        </>
      ) : (
        // Empty state message when no data is available
        <p>No data available.</p>
      )}
    </div>
  );
}
