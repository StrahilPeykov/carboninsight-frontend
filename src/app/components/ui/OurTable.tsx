/**
 * OurTable component provides a responsive data table with pagination and mobile card view.
 * Automatically switches between desktop table and mobile cards based on screen size.
 * Supports custom column rendering, actions, and proper accessibility features.
 */

import React, { ReactNode, useState } from "react";
import Button from "./Button";
import { MobileTableCard } from "./MobileTableCard";
import { TableRow } from "./tableRow";

// Interface defining column configuration for the table
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

/**
 * Responsive table component with automatic mobile card fallback
 * @param title - Optional title displayed above the table
 * @param description - Optional description providing context
 * @param caption - Accessibility caption describing table content
 * @param cardTitle - Prefix text for mobile card titles
 * @param items - Array of data objects to display in rows
 * @param columns - Array of column configurations defining display and behavior
 * @returns Responsive table with pagination that adapts to mobile screens
 */
export function OurTable<T>({
  title,
  description,
  caption,
  cardTitle,
  items,
  columns,
}: OurTableProps<T>) {
  // Pagination state management
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items displayed per page

  // Calculate pagination boundaries
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  /**
   * Type guard function to safely check if a key exists on the data object
   * @param item - Data object to check
   * @param key - Property key to verify
   * @returns Boolean indicating if key exists on object
   */
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
