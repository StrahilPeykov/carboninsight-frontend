<<<<<<< HEAD
/**
 * AuditLog component displays system audit trails with filtering and pagination.
 * Shows user actions, timestamps, and change details for compliance and debugging.
 * Provides responsive design with desktop table and mobile card views.
 */

=======
// React core imports for component state management and lifecycle hooks
>>>>>>> main
import React, { useEffect, useState } from "react";
// Accessible table wrapper component with WCAG compliance and responsive design
import AccessibleTable from "./AccessibleTable";
// Card container component for consistent layout and visual grouping
import Card from "./Card";
// Audit log API types and action definitions for data structure and filtering
// AuditLogActionDefinition: Maps action IDs to human-readable descriptions
// LogItem: TypeScript interface defining audit log entry structure
import { AuditLogActionDefinition, LogItem } from "@/lib/api/auditLogApi";
// Table row component with enhanced styling and interaction capabilities
import { TableRow } from "./tableRow";
// Mobile-optimized card component for responsive audit log display on small screens
import { MobileTableCard } from "./MobileTableCard";
// Consistent button component with theming and accessibility features
import Button from "./Button";

<<<<<<< HEAD
// Interface defining props for AuditLog component
interface AuditLogProps {
  caption: string; // Accessibility caption describing the audit log
  logItems: LogItem[]; // Array of audit log entries to display
}

/**
 * AuditLog component for displaying system audit trails with filtering
 * @param caption - Descriptive text for screen readers about the audit log content
 * @param logItems - Array of audit log entries containing user actions and changes
 * @returns Audit log interface with filtering, pagination, and responsive design
 */
export default function AuditLog({ caption, logItems }: AuditLogProps) {
  // State management for component functionality
  const [expandedId, setExpandedId] = useState<number | null>(null); // Track expanded row for details
  const [selectedAction, setSelectedAction] = useState<number | null>(null); // Filter by action type
  const [currentPage, setCurrentPage] = useState(1); // Current pagination page
  const itemsPerPage = 10; // Number of log entries per page

  /**
   * Toggle expansion state for log entry details
   * @param id - Unique identifier of the log entry
   */
=======
// Props interface for audit log component configuration
// Designed for flexible integration across different audit contexts
interface AuditLogProps {
  caption: string;    // Accessible table caption for screen readers and context
  logItems: LogItem[]; // Array of audit log entries to display and filter
}

// Comprehensive audit log component with filtering, pagination, and responsive design
// Displays user actions, timestamps, and change details for security and compliance
// Implements dual-view pattern: desktop table and mobile cards for optimal UX
// Features advanced filtering by action type and client-side pagination for performance
// Follows WCAG accessibility guidelines with proper ARIA labels and semantic markup
export default function AuditLog({ caption, logItems }: AuditLogProps) {
  // Expandable row state for detailed change information viewing
  // Tracks which audit log entry is currently expanded to show full details
  // Uses null to indicate no row is expanded, improving memory efficiency
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  // Action filter state for audit log entry filtering by action type
  // null represents "show all actions", numeric values filter by specific action ID
  // Integrates with AuditLogActionDefinition for user-friendly filter options
  const [selectedAction, setSelectedAction] = useState<number | null>(null);
  
  // Pagination state management for large audit log datasets
  // Starts at page 1 and resets when filters change for consistent UX
  // Works with itemsPerPage constant to calculate display boundaries
  const [currentPage, setCurrentPage] = useState(1);
  
  // Items per page configuration for pagination performance optimization
  // Fixed at 10 to balance data visibility with loading performance
  // Reduces DOM complexity and improves rendering speed on large datasets
  const itemsPerPage = 10; // Number of rows per page

  // Toggle function for expanding/collapsing audit log entry details
  // Implements accordion-style behavior where only one entry can be expanded
  // Provides smooth user experience for viewing detailed change information
>>>>>>> main
  const toggleExpanded = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

<<<<<<< HEAD
  // Filter log items based on selected action type
  const filteredLogs =
    selectedAction !== null ? logItems.filter(log => log.action === selectedAction) : logItems;

  // Calculate pagination boundaries
=======
  // Filtered logs computation based on selected action filter
  // Applies real-time filtering without server requests for immediate feedback
  // Maintains original data integrity while providing filtered view
  const filteredLogs =
    selectedAction !== null ? logItems.filter(log => log.action === selectedAction) : logItems;

  // Pagination calculations for efficient data slicing and display
  // Computes current page boundaries and total page count dynamically
  // Ensures proper pagination behavior regardless of filter state
>>>>>>> main
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

<<<<<<< HEAD
  // Reset pagination when filter changes
=======
  // Effect hook for pagination reset when filter changes
  // Prevents users from being on invalid pages after filtering
  // Ensures consistent navigation experience across filter state changes
>>>>>>> main
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedAction]);

  return (
    <Card>
      {/* Header section with title and action filter */}
      <div className="flex">
        <h2 className="text-xl font-semibold mb-4">Audit Log</h2>

        {/* Action filter dropdown */}
        <div className="mb-4 ml-auto">
          <label className="mr-2 font-medium text-sm text-gray-700 dark:text-gray-300">
            Filter action:
          </label>
          <select
            value={selectedAction !== null ? selectedAction : "all"}
            onChange={e =>
              setSelectedAction(e.target.value === "all" ? null : Number(e.target.value))
            }
            className="border px-3 py-2 rounded-md bg-white text-black dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All</option>
            {/* Populate filter options from action definitions */}
            {Object.entries(AuditLogActionDefinition).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conditional rendering based on data availability */}
      {paginatedLogs.length > 0 ? (
        <>
          {/* Desktop table view with full audit details */}
          <AccessibleTable caption={caption} className="hidden md:block">
            <thead className="border-b font-bold text-l w-full">
              <tr>
                <td className="py-3 px-6 text-left">Time</td>
                <td className="py-3 px-6 text-left">User</td>
                <td className="py-3 px-6 text-left">Action</td>
                <td className="py-3 px-6 text-left">Changes</td>
              </tr>
            </thead>
            <tbody className="text-sm">
              {paginatedLogs.map(log => (
                <TableRow
                  key={log.id}
                  onClick={() => toggleExpanded(log.id)}
                  className="cursor-pointer"
                >
                  {/* Timestamp column with formatted date */}
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  {/* User who performed the action */}
                  <td className={"py-3 px-6 text-left"}>{log.actor_username}</td>
                  {/* Action type with human-readable label */}
                  <td className="py-3 px-6 text-left">{AuditLogActionDefinition[log.action]}</td>
                  {/* Changes column with expandable content */}
                  <td
                    className={`py-3 px-6 text-left break-words w-full ${expandedId !== log.id ? "truncate max-w-[1px]" : "max-w-[1px]"}`}
                  >
                    {log.changes}
                  </td>
                </TableRow>
              ))}
            </tbody>
          </AccessibleTable>

          {/* Mobile card view for better mobile experience */}
          <div className="md:hidden space-y-2">
            {paginatedLogs.map(log => (
              <MobileTableCard
                key={log.id}
                title={new Date(log.timestamp).toLocaleString()}
                fields={[
                  { label: "User", value: log.actor_username },
                  { label: "Action", value: AuditLogActionDefinition[log.action] },
                  { label: "Changes", value: log.changes },
                ]}
              />
            ))}
          </div>

          {/* Pagination controls for navigating through log entries */}
          <nav className="flex justify-between items-center mt-4" aria-label="Pagination">
            <div className="flex items-center gap-2">
              {/* Previous page button */}
              <Button
                className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {/* Current page indicator */}
              <span className="text-sm" aria-current="page">
                Page {currentPage} of {totalPages}
              </span>
              
              {/* Next page button */}
              <Button
                className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage * itemsPerPage >= filteredLogs.length}
              >
                Next
              </Button>
            </div>
          </nav>
        </>
      ) : (
        // Empty state when no audit logs match the current filter
        <p className="">No audit logs available.</p>
      )}
    </Card>
  );
}
