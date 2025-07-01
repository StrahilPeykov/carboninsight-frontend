"use client";

// Import React hooks and UI components
import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import ImportExportDropdown from "@/app/components/ui/ImportExportDropdown";
import { DataPassedToTabs, TabHandle } from "../../page";
// Import API types for transportation data
import { TransportEmission } from "@/lib/api/transportEmissionApi";
import { LineItem } from "@/lib/api/bomApi";
import { EmissionReference } from "@/lib/api/emissionReferenceApi";
// Import UI components
import Button from "@/app/components/ui/Button";
import { Plus, AlertCircle } from "lucide-react";
// Import dialog components
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { OurTable } from "@/app/components/ui/OurTable";
// Import utility functions
import * as apiCalls from "./api-calls";
import * as Helpers from "./helpers";
import { FormData, getTransportColumns } from "./types";
import { LifecycleStageChoice } from "@/lib/api";
import TransportEmissionModal from "./TransportEmissionModal";

// Main transportation tab component that implements the TabHandle interface
// This component manages all transportation-related carbon emissions for a product
// It provides a complete UI for listing, adding, editing, and deleting transport emissions
// The component contains multiple modals for various operations and implements the parent's
// tab interface contract through the forwardRef and useImperativeHandle pattern
// It maintains several state variables to track emissions data,
// loading states, and UI interactions
const Index = forwardRef<TabHandle, DataPassedToTabs>(
  ({ productId: productIdString, onFieldChange }, ref) => {
    // State for emissions data
    const [emissions, setEmissions] = useState<TransportEmission[]>([]);
    // Loading state for data fetching
    const [isLoading, setIsLoading] = useState(false);
    // Modal visibility states
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Modal for deleting emissions
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    // Current emission being edited or deleted
    const [currentEmission, setCurrentEmission] = useState<TransportEmission | null>(null);
    // State for managing deletion of emissions
    const [deletingEmissionId, setDeletingEmissionId] = useState<number | null>(null);
    // State for form submission
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Form data for creating/editing emissions
    const [formData, setFormData] = useState<FormData>({
      distance: "",
      weight: "",
      reference: "",
      override_factors: [],
      line_items: [],
    });
    // Reference data for dropdowns
    const [references, setReferences] = useState<EmissionReference[]>([]);
    // Query for filtering references
    const [referenceQuery, setReferenceQuery] = useState("");
    // BOM items for association with emissions
    const [bomLineItems, setBomLineItems] = useState<LineItem[]>([]);
    // Query for filtering BOM line items
    const [bomLineItemQuery, setBomLineItemQuery] = useState("");
    // Lifecycle stage options
    const [lifecycleChoices, setLifecycleChoices] = useState<LifecycleStageChoice[]>([]);
    // Detail view modal states
    const [showOverridesForEmission, setShowOverridesForEmission] =
      useState<TransportEmission | null>(null);
    // Modal for viewing associated BOM items
    const [showBomItemsForEmission, setShowBomItemsForEmission] =
      useState<TransportEmission | null>(null);
    // Modal for uploading templates
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    // State for managing deletion confirmation
    const [isDeleting, setIsDeleting] = useState(false);

    // Convert string product ID to number
    const productId = () => {
      return parseInt(productIdString || "", 10);
    };

    // Get company ID from local storage
    const companyPkString = localStorage.getItem("selected_company_id");
    // Ensure company ID is available
    if (!companyPkString) {
      // Return null to indicate no company ID available
      return null;
    }
    // Store id of the selected company as a number
    const company_pk = parseInt(companyPkString, 10);

    // Expose methods to parent component through ref
    useImperativeHandle(ref, () => ({
      // Method to validate the tab before saving
      saveTab: async (): Promise<string> => {
        // No validation needed for this tab
        return "";
      },
      // Method to update the tab
      updateTab: async (): Promise<string> => {
        // No update function needed for this tab
        return "";
      },
    }));

    // Load initial data when component mounts or product ID changes
    useEffect(() => {
      // Only fetch data when a valid product ID is available
      if (productIdString) {
        // Get transportation emissions for this product and update the emissions state
        apiCalls.fetchEmissions(setIsLoading, company_pk, productId, setEmissions);
        // Get bill of materials items to associate with emissions
        apiCalls.fetchBomLineItems(company_pk, productId, setBomLineItems);
        // Get available lifecycle stages for emission override factors
        apiCalls.fetchLifecycleChoices(company_pk, productId, setLifecycleChoices);
        // Get emission reference data for dropdown selection
        apiCalls.fetchReferences(setReferences);
      }
    }, [productIdString]);

    // Configure table columns with handlers
    const columns = getTransportColumns(
      references,
      setShowOverridesForEmission,
      setShowBomItemsForEmission,
      setCurrentEmission,
      setFormData,
      company_pk,
      productId,
      setBomLineItems,
      setLifecycleChoices,
      setReferences,
      setIsModalOpen,
      setDeletingEmissionId,
      setIsDeleteModalOpen
    );

    return (
      <>
        {/* Header section with title and description */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Transportation Emissions</h2>
          <p className="mb-4">Add or manage transportation emissions.</p>
        </div>

        {/* Emissions data table with loading and empty states */}
        {
          // Show loading state while fetching data
          // If no emissions data is available, show empty state
          // Otherwise, render the emissions table with configured columns
          isLoading ? (
            <div className="text-center py-6">Data loading...</div>
          ) : emissions.length === 0 ? (
            <div className="text-center py-6">No transport emissions yet.</div>
          ) : (
            <OurTable
              caption="A table displaying the transport emissions of this product."
              cardTitle="Emission #"
              // Pass the emissions data to the table
              items={emissions}
              // Pass the columns configuration to the table
              columns={columns}
            />
          )}

        {/* Action buttons for adding emissions and import/export */}
        <div className="mt-6">
          <Button
            // Open modal to add a new transport emission
            onClick={() =>
              Helpers.handleOpenModal(
                setCurrentEmission,
                setFormData,
                company_pk,
                productId,
                setBomLineItems,
                setLifecycleChoices,
                setReferences,
                setIsModalOpen
              )
            }
            className="flex items-center gap-2"
            variant="primary"
          >
            <Plus className="w-4 h-4" /> Add Transport Emission
          </Button>
          <ImportExportDropdown
            // Dropdown for importing/exporting emissions data
            // Pass the company ID to the dropdown
            companyId={company_pk}
            // Pass the product ID to the dropdown
            productId={productId()}
            section="transport"
            onImportComplete={() =>
              // Refresh emissions data after successful import by fetching updated data from API
              apiCalls.fetchEmissions(setIsLoading, company_pk, productId, setEmissions)
            }
            showTemplateModal={showTemplateModal}
            setShowTemplateModal={setShowTemplateModal}
          />
        </div>

        {/* Template upload error modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Template File Blocked
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Template files cannot be uploaded. Please provide a valid data file instead.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={
                    // Close the template modal
                    () => setShowTemplateModal(false)}
                  className="bg-red text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main modal for adding/editing emissions */}
        <TransportEmissionModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          currentEmission={currentEmission}
          setCurrentEmission={setCurrentEmission}
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          references={references}
          referenceQuery={referenceQuery}
          setReferenceQuery={setReferenceQuery}
          bomLineItems={bomLineItems}
          bomLineItemQuery={bomLineItemQuery}
          setBomLineItemQuery={setBomLineItemQuery}
          lifecycleChoices={lifecycleChoices}
          onFieldChange={onFieldChange}
          company_pk={company_pk}
          productId={productId}
          setEmissions={setEmissions}
          setIsLoading={setIsLoading}
        />

        {/* Confirmation dialog for emission deletion */}
        {isDeleteModalOpen && (
          <Dialog
            open={isDeleteModalOpen}
            as="div"
            // Ensure dialog is properly positioned and can be scrolled
            className="fixed inset-0 z-20 overflow-y-auto"
            // Close dialog when clicking outside or pressing escape
            onClose={() => setIsDeleteModalOpen(false)}
          >
            <div className="min-h-screen px-4 text-center">
              <div className="fixed inset-0 bg-black/50" />
              <span className="inline-block h-screen align-middle" aria-hidden="true">
                &#8203;
              </span>
              <DialogPanel className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
                <DialogTitle className="flex items-center gap-3 mb-4 text-red">
                  <AlertCircle className="w-6 h-6" />
                  <span className="text-lg font-semibold">Confirm Deletion</span>
                </DialogTitle>
                <p className="mb-6">
                  Are you sure you want to delete this transport emission? This action cannot be
                  undone.
                </p>
                <div className="flex justify-end gap-2">
                  <Button onClick={() => 
                    // Close the delete confirmation modal without action
                    setIsDeleteModalOpen(false)} variant="outline">
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      // Handle emission deletion
                      // Call API to delete the emission and update state
                      apiCalls.handleDelete(
                        deletingEmissionId,
                        company_pk,
                        productId,
                        setEmissions,
                        emissions,
                        setIsDeleteModalOpen,
                        onFieldChange,
                        setIsDeleting
                      )
                    }
                    variant="primary"
                    disabled={isDeleting}
                    className="bg-red hover:bg-red-800 text-white"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        )}

        {/* Modal for viewing emission override factors */}
        <Dialog
          open={!!showOverridesForEmission}
          as="div"
          className="fixed inset-0 z-20 overflow-y-auto"
          // Close modal when clicking outside or pressing escape
          onClose={() => setShowOverridesForEmission(null)}
        >
          <div className="min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-black/50" />
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <DialogPanel className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
              <DialogTitle
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
              >
                Override Factors
              </DialogTitle>
              <div className="mt-4">
                {/* Show override factors table if they exist */}
                {
                  // Check if the emission has override factors
                  showOverridesForEmission?.override_factors &&
                    // Ensure there are override factors to display
                    showOverridesForEmission.override_factors.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Lifecycle Stage
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Biogenic CO₂
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Non-Biogenic CO₂
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {showOverridesForEmission.override_factors.map((factor, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                              {
                                // Find the display name for the lifecycle stage by searching
                                // through lifecycleChoices array. First tries to match the
                                // factor's lifecycle_stage value with a choice value.
                                // Uses optional chaining (?.) to safely access the 
                                // display_name if a match is found. Falls back to the raw
                                // lifecycle_stage value if no matching choice is found (using ??
                                // operator).
                                lifecycleChoices.find(c => c.value === factor.lifecycle_stage)
                                  ?.display_name ?? factor.lifecycle_stage
                              }
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                              {factor.co_2_emission_factor_biogenic}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                              {factor.co_2_emission_factor_non_biogenic}
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
                  // Close the modal for viewing override factors
                  onClick={
                    () => setShowOverridesForEmission(null)}
                  variant="primary"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Modal for viewing associated BOM items */}
        <Dialog
          open={!!showBomItemsForEmission}
          as="div"
          className="fixed inset-0 z-20 overflow-y-auto"
          // Close modal when clicking outside or pressing escape
          onClose={() => setShowBomItemsForEmission(null)}
        >
          <div className="min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-black/50" />
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <DialogPanel className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
              <DialogTitle
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
              >
                Associated BOM Items
              </DialogTitle>
              <div className="mt-4">
                {/* Show BOM items table if they exist */}
                {showBomItemsForEmission?.line_items && bomLineItems.length > 0 ? (
                  <div className="overflow-y-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Product Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Quantity
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {/* Map through BOM line items to display */}
                        {showBomItemsForEmission.line_items.map(itemId => {
                          // Find the corresponding item in the BOM line items
                          const item = bomLineItems.find(i => i.id === itemId);
                          // Render a table row for each item
                          // If item is not found, display "Unknown Item"
                          return (
                            <tr key={itemId}>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                {itemId}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                {item ? item.line_item_product.name : "Unknown Item"}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
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
                <Button
                  // Close the modal for viewing BOM items
                  onClick={() => setShowBomItemsForEmission(null)}
                  variant="primary"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      </>
    );
  }
);

// Set display name for React DevTools
Index.displayName = "Transportation";
// Export the component as the default export
export default Index;
