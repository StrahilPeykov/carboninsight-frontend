import React, { useState } from "react";
import AccessibleTable from "./AccessibleTable";
import Card from "./Card";
import Button from "./Button";
import { MobileTableCard } from "./MobileTableCard";
import { TableRow } from "./tableRow";

export interface Column<T> {
  key: keyof T | "actions"; // Falls back to the "actions" when no key is entered.
  label: string; // Actual header label to be displayed
  render?: (value: unknown, row: T) => React.ReactNode; // Allows modifications to the rendering of the value.
}

interface OurTableProps<T> {
  title?: string;
  description?: string;
  caption: string;
  items: T[];
  columns: Column<T>[];
}

export function OurTable<T>({ title, description, caption, items, columns }: OurTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  return (
    <Card className="w-full">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      {description && <h3 className="text-md mb-4 dark:text-gray-400"> {description} </h3>}

      {paginatedItems.length > 0 ? (
        <>
          {/* Desktop Table */}
          <AccessibleTable caption={caption} className="hidden md:block w-full">
            <thead className="border-b font-bold text-l">
              <tr>
                {columns.map(({ key, label }, idx) => {
                  const alignmentClass = key === "actions" ? "text-right" : "text-left";
                  return (
                    <td key={idx} className={`py-3 px-6 ${alignmentClass} whitespace-nowrap`}>
                      {label}
                    </td>
                  );
                })}
              </tr>
            </thead>
            <tbody className="text-sm">
              {paginatedItems.map((item, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map(({ key, render }, colIndex) => {
                    const value = key === "actions" ? undefined : item[key as keyof T];
                    const alignmentClass = key === "actions" ? "text-right" : "text-left";

                    return (
                      <td
                        key={colIndex}
                        className={`py-3 px-6 ${alignmentClass} whitespace-nowrap min-w-0 w-[1%]`}
                      >
                        {render ? render(value, item) : String(value ?? "")}
                      </td>
                    );
                  })}
                </TableRow>
              ))}
            </tbody>
          </AccessibleTable>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {paginatedItems.map((item, rowIndex) => {
              const fields = columns
                .filter(col => col.key !== "actions")
                .map(col => {
                  const rawValue = item[col.key as keyof T];

                  let value: string | number;
                  if (typeof rawValue === "string" || typeof rawValue === "number") {
                    value = rawValue;
                  } else {
                    value = "";
                  }

                  return { label: col.label, value: value };
                });

              return (
                <MobileTableCard
                  key={rowIndex}
                  title={fields[0].value?.toString() || `Item #${startIndex + rowIndex + 1}`}
                  fields={fields.slice(1)}
                  actions={columns.find(col => col.key === "actions")?.render?.(undefined, item)}
                />
              );
            })}
          </div>

          {/* Pagination */}
          <nav className="flex justify-between items-center mt-4" aria-label="Pagination">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </nav>
        </>
      ) : (
        <p>No data available.</p>
      )}
    </Card>
  );
}
