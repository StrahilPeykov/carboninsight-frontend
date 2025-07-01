"use client";

/* Imports */
import React from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Button from "@/app/components/ui/Button";

import { ProductionEnergyEmission } from "@/lib/api/productionEmissionApi";
import { lifecycleOptions } from "./types";

/* Prop types */
type OverrideFactorsModalProps = {
    showFactorsForEmission: ProductionEnergyEmission | null;
    setShowFactorsForEmission: React.Dispatch<
        React.SetStateAction<ProductionEnergyEmission | null>
    >;
};

/*  Component */
const OverrideFactorsModal: React.FC<OverrideFactorsModalProps> = ({
    showFactorsForEmission,
    setShowFactorsForEmission,
}) => {
    return (
        /* Override Factors Modal */
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
