"use client";

import React from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Button from "@/app/components/ui/Button";
import { UserEnergyEmission } from "@/lib/api/userEnergyEmissionApi";
import { LineItem } from "@/lib/api/bomApi";

interface BomItemsDisplayModalProps {
  emission: UserEnergyEmission | null;
  bomLineItems: LineItem[];
  onClose: () => void;
}

export default function BomItemsDisplayModal({
  emission,
  bomLineItems,
  onClose,
}: BomItemsDisplayModalProps) {
  return (
    <Dialog
      open={!!emission}
      as="div"
      className="fixed inset-0 z-20 overflow-y-auto"
      onClose={onClose}
      aria-labelledby="user-energy-bom-items-modal-title"
    >
      <div className="min-h-screen px-4 text-center">
        <div className="fixed inset-0 bg-black/50" />
        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>
        <DialogPanel className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
          <DialogTitle
            id="user-energy-bom-items-modal-title"
            as="h3"
            className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
          >
            Associated BOM Items
          </DialogTitle>

          <div className="mt-4">
            {emission?.line_items && bomLineItems.length > 0 ? (
              <div className="overflow-y-auto max-h-96">
                <table
                  className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                  role="table"
                >
                  <caption className="sr-only">
                    BOM items associated with user energy emission {emission.id}
                  </caption>
                  <thead role="rowgroup">
                    <tr role="row">
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        ID
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Product Name
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700" role="rowgroup">
                    {emission.line_items.map(itemId => {
                      const item = bomLineItems.find(i => i.id === itemId);
                      return (
                        <tr key={itemId} role="row">
                          <td className="px-4 py-2" role="cell">
                            {itemId}
                          </td>
                          <td className="px-4 py-2" role="cell">
                            {item ? item.line_item_product.name : "Unknown Item"}
                          </td>
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
              <p className="text-gray-500 dark:text-gray-300">No BOM items found.</p>
            )}
          </div>

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
