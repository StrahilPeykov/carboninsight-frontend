import React, { ReactNode, useState } from "react";
import Button from "./Button";
import { MobileTableCard } from "./MobileTableCard";
import { TableRow } from "./tableRow";

export interface Column<T> {
  key: keyof T | string; // "actions" is a special value for buttons.
  label: string;
  render?: (value: unknown, row: T) => ReactNode; // Allows modifications to the rendering of the value.
}

interface OurTableProps<T> {
  title?: string;
  description?: string;
  caption: string;
  cardTitle?: string;
  items: T[];
  columns: Column<T>[];
}

export function OurTable<T>({
  title,
  description,
  caption,
  cardTitle,
  items,
  columns,
}: OurTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  function isKnownKey<T>(item: T, key: string): key is Extract<keyof T, string> {
    return Object.prototype.hasOwnProperty.call(item, key);
  }

  return (
    <div className="min-w-full">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      {description && <h3 className="text-md mb-4 dark:text-gray-400"> {description} </h3>}

      {paginatedItems.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <caption className="sr-only">{caption}</caption>
              <thead className="border-b font-bold text-md">
                <tr>
                  {columns.map(({ key, label }, idx) => {
                    const alignmentClass = key === "actions" ? "text-right" : "text-left";
                    return (
                      <th key={idx} className={`p-2 ${alignmentClass}`}>
                        {label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="text-sm">
                {paginatedItems.map((item, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map(({ key, render }, colIndex) => {
                      let value: unknown = undefined;

                      if (key !== "actions" && typeof key === "string" && isKnownKey(item, key)) {
                        value = item[key];
                      }

                      const alignmentClass = key === "actions" ? "text-right" : "text-left";

                      return (
                        <td key={colIndex} className={`p-2 ${alignmentClass}`}>
                          {render ? render(value, item) : String(value ?? "")}
                        </td>
                      );
                    })}
                  </TableRow>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {paginatedItems.map((item, rowIndex) => {
              const fields = columns
                .filter(col => col.key !== "actions")
                .map(col => {
                  let rawValue: unknown = undefined;

                  if (typeof col.key === "string" && isKnownKey(item, col.key)) {
                    rawValue = item[col.key];
                  }

                  const rendered = col.render ? col.render(rawValue, item) : rawValue;

                  return {
                    label: col.label,
                    value: rendered as ReactNode,
                  };
                });

              return (
                <MobileTableCard
                  key={rowIndex}
                  title={cardTitle ? cardTitle + (rowIndex + 1) : fields[0].value}
                  fields={cardTitle ? fields : fields.slice(1)}
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
                className="hover:cursor-pointer"
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
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
        <p>No data available.</p>
      )}
    </div>
  );
}
