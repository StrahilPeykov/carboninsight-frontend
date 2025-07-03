/**
 * BomItemsDisplayModal Component
 *
 * This modal displays the Bill of Materials (BOM) items associated with a specific
 * user energy emission. It shows the relationship between energy consumption and
 * product components, allowing users to trace energy usage to specific materials.
 *
 * The component implements:
 * - Responsive modal dialog using Headless UI
 * - Accessible table with proper ARIA roles
 * - Dark mode compatibility with theme classes
 * - Proper focus management for keyboard navigation.
 *
 * @module BomItemsDisplayModal
 */

"use client";

import React from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Button from "@/app/components/ui/Button";
import { UserEnergyEmission } from "@/lib/api/userEnergyEmissionApi";
import { LineItem } from "@/lib/api/bomApi";

/**
 * Props interface for the BomItemsDisplayModal component
 *
 * @property {UserEnergyEmission | null} emission - The energy emission data containing line item IDs
 * @property {LineItem[]} bomLineItems - Array of BOM line items with product details
 * @property {Function} onClose - Handler function called when modal is closed
 */
interface BomItemsDisplayModalProps {
  emission: UserEnergyEmission | null;
  bomLineItems: LineItem[];
  onClose: () => void;
}

/**
 * BomItemsDisplayModal component renders a modal dialog showing BOM items
 * associated with a specific user energy emission.
 *
 * When an emission is null, the modal remains closed. When an emission contains
 * line_items, those are matched against the provided bomLineItems array to
 * display detailed information about each BOM component.
 *
 * @param {BomItemsDisplayModalProps} props - Component properties
 * @returns {JSX.Element} Rendered modal dialog component
 */
export default function BomItemsDisplayModal({
  emission,
  bomLineItems,
  onClose,
}: BomItemsDisplayModalProps) {
  return (
    <Dialog
      // Modal is only open when emission data is available
      open={!!emission}
      as="div"
      className="fixed inset-0 z-20 overflow-y-auto"
      onClose={onClose}
      aria-labelledby="user-energy-bom-items-modal-title"
    >
      {/* Modal wrapper with full-screen background */}
      <div className="min-h-screen px-4 text-center">
        {/* Semi-transparent backdrop overlay */}
        <div className="fixed inset-0 bg-black/50" />

        {/* Hidden span to vertically center the modal panel */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal content panel with responsive sizing and theming */}
        <DialogPanel className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
          {/* Modal title with proper heading semantics */}
          <DialogTitle
            id="user-energy-bom-items-modal-title"
            as="h3"
            className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
          >
            Associated BOM Items
          </DialogTitle>

          {/* Modal body content with conditional rendering */}
          <div className="mt-4">
            {/* Conditional rendering based on emission data and BOM items availability */}
            {emission?.line_items && bomLineItems.length > 0 ? (
              // Scrollable container for table with fixed height
              <div className="overflow-y-auto max-h-96">
                {/* Accessible table with proper ARIA roles */}
                <table
                  className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                  role="table"
                >
                  {/* Screen reader caption for table context */}
                  <caption className="sr-only">
                    BOM items associated with user energy emission {emission.id}
                  </caption>

                  {/* Table header with column definitions */}
                  <thead role="rowgroup">
                    <tr role="row">
                      {/* ID column header */}
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        ID
                      </th>
                      {/* Product name column header */}
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Product Name
                      </th>
                      {/* Quantity column header */}
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Quantity
                      </th>
                    </tr>
                  </thead>

                  {/* Table body with mapped BOM item rows */}
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700" role="rowgroup">
                    {/* Map through emission line items and find matching BOM items */}
                    {emission.line_items.map(itemId => {
                      // Find the corresponding BOM line item by ID
                      const item = bomLineItems.find(i => i.id === itemId);
                      return (
                        // Table row for each BOM item with unique key
                        <tr key={itemId} role="row">
                          {/* Item ID cell */}
                          <td className="px-4 py-2" role="cell">
                            {itemId}
                          </td>
                          {/* Product name cell with fallback for missing items */}
                          <td className="px-4 py-2" role="cell">
                            {item ? item.line_item_product.name : "Unknown Item"}
                          </td>
                          {/* Quantity cell with fallback for missing items */}
                          <td className="px-4 py-2" role="cell">
                            {item ? item.quantity : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              // Fallback message when no BOM items are available
              <p className="text-gray-500 dark:text-gray-300">No BOM items found.</p>
            )}
          </div>

          {/* Modal footer with close button */}
          <div className="mt-6">
            <Button onClick={onClose} variant="primary" className="w-full">
              Close
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
