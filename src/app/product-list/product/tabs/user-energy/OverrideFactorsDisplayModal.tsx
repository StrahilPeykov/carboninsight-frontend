// Client component directive - ensures component renders on client side
// Required for interactive modal behavior and DOM manipulation
"use client";

import React from "react";
// Headless UI components for accessible modal implementation
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
// Reusable button component with consistent styling
import Button from "@/app/components/ui/Button";
// Type definition for user energy emission data structure
import { UserEnergyEmission } from "@/lib/api/userEnergyEmissionApi";
// Available lifecycle stage options for energy emissions.
import { lifecycleOptions } from "./types";

// Props interface for the override factors display modal
interface OverrideFactorsDisplayModalProps {
  emission: UserEnergyEmission | null;  // Emission data to display, null when modal should be hidden
  onClose: () => void;                  // Handler function to close the modal
}

/**
 * Modal component that displays override factors for user energy emissions
 * Shows a detailed table of lifecycle stages and their CO₂ emission factors
 * 
 * @param props The component props
 * @param props.emission The emission data containing override factors to display
 * @param props.onClose Function to call when modal should close
 */
export default function OverrideFactorsDisplayModal({
  emission,
  onClose,
}: OverrideFactorsDisplayModalProps) {
  return (
    <Dialog
      open={!!emission}
      as="div"
      className="fixed inset-0 z-20 overflow-y-auto"
      onClose={onClose}
      aria-labelledby="user-energy-factors-modal-title"
    >
      <div className="min-h-screen px-4 text-center">
        {/* Static backdrop */}
        <div className="fixed inset-0 bg-black/50" />

        {/* This element centers the modal contents */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>

        <DialogPanel className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
          <DialogTitle
            id="user-energy-factors-modal-title"
            as="h3"
            className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
          >
            Overrides
          </DialogTitle>

          <div className="mt-4">
            {emission?.override_factors && emission.override_factors.length > 0 ? (
              <table
                className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                role="table"
              >
                <caption className="sr-only">
                  Override factors for user energy emission {emission.id}
                </caption>
                <thead role="rowgroup">
                  <tr role="row">
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Lifecycle Stage
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      CO₂ Emission Factor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700" role="rowgroup">
                  {emission.override_factors.map((factor, index) => (
                    <tr key={index} role="row">
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white" role="cell">
                        {lifecycleOptions.find(opt => opt.startsWith(factor.lifecycle_stage ?? "")) ||
                          factor.lifecycle_stage}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white" role="cell">
                        <div>Bio: {factor.co_2_emission_factor_biogenic}</div>
                        <div>Non-bio: {factor.co_2_emission_factor_non_biogenic}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 dark:text-gray-300">No overrides found.</p>
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
