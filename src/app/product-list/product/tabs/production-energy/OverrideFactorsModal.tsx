// Client-side modal component for displaying override emission factors
// Provides read-only view of custom emission factors that override default references
// Essential for transparency in carbon footprint calculations and audit trail
"use client";

// Core React library for component architecture and hooks
/* Imports */
import React from "react";
// Headless UI dialog components for accessible modal implementation
// Dialog provides proper focus management, keyboard navigation, and ARIA support
// DialogPanel creates the modal content container with proper semantics
// DialogTitle ensures proper heading structure and screen reader compatibility
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
// Custom button component with consistent styling and interaction patterns
import Button from "@/app/components/ui/Button";

// API type definition for production energy emission data structure
// ProductionEnergyEmission contains override factors and calculation metadata
import { ProductionEnergyEmission } from "@/lib/api/productionEmissionApi";
// Local type definitions for lifecycle stage options and display formatting
// lifecycleOptions provides human-readable labels for emission factor categories
import { lifecycleOptions } from "./types";

// TypeScript interface defining props contract for OverrideFactorsModal component
// Implements controlled modal pattern for predictable state management
// Enables parent components to control modal visibility and data display
// Provides type safety for emission data handling and state mutations
/* Prop types */
type OverrideFactorsModalProps = {
    // Current emission record to display override factors for (null when modal closed)
    // When non-null, triggers modal display with emission's override factor data
    // Null value indicates modal should be hidden/closed
    showFactorsForEmission: ProductionEnergyEmission | null;
    // State setter function for controlling modal visibility and data
    // Enables parent components to open modal with specific emission data
    // Setting to null closes the modal and clears displayed data
    setShowFactorsForEmission: React.Dispatch<
        React.SetStateAction<ProductionEnergyEmission | null>
    >;
};

// OverrideFactorsModal functional component with comprehensive prop destructuring
// Displays read-only tabular view of custom emission factors for transparency
// Critical for auditing carbon footprint calculations and understanding deviations
// from standard emission reference values used in lifecycle assessments
/*  Component */
const OverrideFactorsModal: React.FC<OverrideFactorsModalProps> = ({
    // Emission record containing override factors to display (null when modal closed)
    showFactorsForEmission,
    // Function to close modal and clear displayed emission data
    setShowFactorsForEmission,
}) => {
    return (
        // Override Factors Modal
        <Dialog
            open={!!showFactorsForEmission}
            as="div"
            className="fixed inset-0 z-20 overflow-y-auto"
            onClose={() => setShowFactorsForEmission(null)}
            aria-labelledby="factors-modal-title"
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
                        id="factors-modal-title"
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                    >
                        Overrides
                    </DialogTitle>

                    <div className="mt-4">
                        {showFactorsForEmission?.override_factors &&
                            showFactorsForEmission.override_factors.length > 0 ? (
                            <table
                                className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                                role="table"
                            >
                                <caption className="sr-only">
                                    Override factors for emission {showFactorsForEmission.id}
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
                                <tbody
                                    className="divide-y divide-gray-200 dark:divide-gray-700"
                                    role="rowgroup"
                                >
                                    {showFactorsForEmission.override_factors.map((factor, index) => (
                                        <tr key={index} role="row">
                                            <td
                                                className="px-4 py-2 text-sm text-gray-900 dark:text-white"
                                                role="cell"
                                            >
                                                {lifecycleOptions.find((opt) =>
                                                    opt.startsWith(factor.lifecycle_stage ?? "")
                                                ) || factor.lifecycle_stage}
                                            </td>
                                            <td
                                                className="px-4 py-2 text-sm text-gray-900 dark:text-white"
                                                role="cell"
                                            >
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
                        <Button
                            onClick={() => setShowFactorsForEmission(null)}
                            variant="primary"
                            className="w-full"
                        >
                            Close
                        </Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default OverrideFactorsModal;
