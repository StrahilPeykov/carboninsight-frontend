import React from "react";
import { X, ChevronDown } from "lucide-react";
// Headless UI components for accessible UI elements
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import Button from "@/app/components/ui/Button";
// Type definitions
import { FormData } from "./types";
import { TransportEmission } from "@/lib/api/transportEmissionApi";
import { LineItem } from "@/lib/api/bomApi";
import { EmissionReference } from "@/lib/api/emissionReferenceApi";
import { LifecycleStageChoice } from "@/lib/api";
// Component for managing emission override factors
import OverrideModal from "../components/OverrideModal";
import { FormDataWithOverrideFactors } from "../components/OverrideModal";
// API and helper functions separated for better organization
import * as apiCalls from "./api-calls";
import * as Helpers from "./helpers";

// Props interface for TransportEmissionModal component
// Contains all the state, data and handlers needed for the modal
interface TransportEmissionModalProps {
  // Controls modal visibility
  isModalOpen: boolean;
  // Toggle modal visibility                                          
  setIsModalOpen: (value: boolean) => void;
  // The emission being edited (null if creating new)                      
  currentEmission: TransportEmission | null;
  // Updates current emission                     
  setCurrentEmission: (emission: TransportEmission | null) => void;
  // Form state data
  formData: FormData;
  // Form state setter                                          
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  // Loading state for form submission  
  isSubmitting: boolean;
  // Toggle submit loading state
  setIsSubmitting: (value: boolean) => void;
  // Available emission references
  references: EmissionReference[];
  // Search query for references dropdown                              
  referenceQuery: string;
  // Update reference search query                                      
  setReferenceQuery: (value: string) => void;
  // Bill of Materials items                  
  bomLineItems: LineItem[];
  // Search query for BOM items dropdown                                     
  bomLineItemQuery: string;
  // Update BOM search query                                     
  setBomLineItemQuery: (value: string) => void;
  // Available lifecycle stages                
  lifecycleChoices: LifecycleStageChoice[];
  // Generic field change handler                 
  onFieldChange: (field?: string, value?: any, meta?: any) => void;
  // Company ID for API calls
  company_pk: number;
  // Function to get current product ID                                           
  productId: () => number;
  // Update emissions list                                      
  setEmissions: React.Dispatch<React.SetStateAction<TransportEmission[]>>;
  // Page loading state
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

// TransportEmissionModal - A modal dialog for creating and editing transportation emissions data
//
// This component provides a comprehensive form interface for users to input transportation-related
// emission data including distance, weight, reference emission factors, and associated BOM items.
// It allows users to create and edit transport emissions with detailed parameters for accurate 
// carbon footprint calculation. The modal integrates searchable dropdowns for selecting emission 
// references and Bill of Materials line items, supporting both single and multi-select behaviors.
//
// The component includes validation to ensure required fields are completed before submission,
// and provides real-time feedback to users. It handles both creation of new emission entries and
// editing of existing ones, with context-aware UI elements that adapt based on the current mode.
//
// It also provides capability to set override factors for emissions calculations, allowing users
// to customize calculation parameters when standard reference values aren't appropriate. The modal
// integrates with the application's API layer for saving data and maintains consistent UI patterns
// with the rest of the application through shared components and styling approaches.
const TransportEmissionModal: React.FC<TransportEmissionModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  currentEmission,
  setCurrentEmission,
  formData,
  setFormData,
  isSubmitting,
  setIsSubmitting,
  references,
  referenceQuery,
  setReferenceQuery,
  bomLineItems,
  bomLineItemQuery,
  setBomLineItemQuery,
  lifecycleChoices,
  onFieldChange,
  company_pk,
  productId,
  setEmissions,
  setIsLoading,
}) => {
  return (
    // Main dialog component with backdrop and positioning
    <Dialog
      open={isModalOpen}
      as="div"
      className="fixed inset-0 overflow-y-auto pt-12 z-20"
      onClose={() => Helpers.handleCloseModal(setIsModalOpen, setCurrentEmission)}
    >
      <div className="min-h-screen px-4 text-center">
        {/* Semi-transparent backdrop */}
        <div className="fixed inset-0 bg-black/50" />
        {/* Helper element for vertical centering */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>
        {/* Main modal panel */}
        <DialogPanel className="relative inline-block w-full max-w-lg p-6 my-8 overflow-visible text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
          {/* Modal header with title and close button */}
          <div className="flex justify-between items-center mb-4">
            <DialogTitle
              as="h3"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              {currentEmission ? "Edit Transport Emission" : "Add Transport Emission"}
            </DialogTitle>
            <button
              onClick={() => Helpers.handleCloseModal(setIsModalOpen, setCurrentEmission)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form fields container */}
          <div className="space-y-4">
            {/* Distance input field */}
            <div>
              <label
                htmlFor="distance"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Distance (km) *
              </label>
              <input
                type="number"
                id="distance"
                min="0"
                step="0.01"
                value={formData.distance ?? ""}
                onChange={e =>
                  setFormData({
                    ...formData,
                    distance: e.target.value,
                  })
                }
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            {/* Weight input field */}
            <div>
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Weight (tonnes) *
              </label>
              <input
                type="number"
                id="weight"
                min="0"
                step="0.01"
                value={formData.weight ?? ""}
                onChange={e =>
                  setFormData({
                    ...formData,
                    weight: e.target.value,
                  })
                }
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            {/* Reference Emission Factor combobox (searchable dropdown) */}
            <div>
              <label
                htmlFor="reference"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Reference Emission Factor *
              </label>
              <div className="relative">
                <Combobox
                  value={
                    // Display selected reference name or empty string:
                    // - If reference ID exists in formData, find matching reference and show its name
                    // - Use optional chaining (?.) to safely access name property
                    // - Fallback to empty string if reference not found or has no name
                    // - Return empty string if no reference selected
                    formData.reference
                      ? references.find(ref => ref.id.toString() === formData.reference)
                        ?.name || ""
                      : ""
                  }
                  onChange={(value: string | null) => {
                    // Handle empty value case
                    if (!value) {
                      setFormData({
                        ...formData,
                        reference: "",
                      });
                      return;
                    }
                    // Find and set the selected reference
                    const selected = references.find(ref => ref.name === value);
                    // Update form state with selected reference ID or empty string if not found
                    setFormData({
                      ...formData,
                      reference: selected ? selected.id.toString() : "",
                    });
                  }}
                >
                  {/* Combobox input and dropdown button */}
                  <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-left">
                    <ComboboxInput
                      className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white focus:ring-0 bg-white dark:bg-gray-700"
                      displayValue={(val: string) => val}
                      onChange={e => setReferenceQuery(e.target.value)}
                      placeholder="Select a reference"
                    />
                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </ComboboxButton>
                  </div>
                  {/* Dropdown options list */}
                  <div className="relative w-full">
                    <ComboboxOptions className="absolute z-[200] max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {/* Filter and map reference options based on search query */}
                      {references
                        // Filter references by:
                        // 1. Show all references when search query is empty
                        // 2. Show only references whose names contain the search query (case-insensitive)
                        .filter(
                          ref =>
                            referenceQuery === "" ||
                            ref.name.toLowerCase().includes(referenceQuery.toLowerCase())
                        )
                        .map(ref => (
                          <ComboboxOption
                            key={ref.id}
                            value={ref.name}
                            className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-white data-focus:bg-red-100 dark:data-focus:bg-red data-hover:bg-gray-100 dark:data-hover:bg-gray-600"
                          >
                            {ref.name}
                          </ComboboxOption>
                        ))}
                    </ComboboxOptions>
                  </div>
                </Combobox>
              </div>
            </div>

            {/* BOM Line Items combobox with multi-select and tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Associated BOM Items
              </label>
              {/* Display selected BOM items as tags */}
              {formData.line_items.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.line_items.map(itemId => {
                    const item = bomLineItems.find(i => i.id === itemId);
                    return (
                      <div
                        key={itemId}
                        className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                      >
                        <span>{item ? item.line_item_product.name : `Item #${itemId}`}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              line_items: formData.line_items.filter(id => id !== itemId),
                            });
                          }}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Combobox for selecting additional BOM items */}
              <div className="relative">
                <Combobox
                  value=""
                  onChange={(value: any) => {
                    if (value && !formData.line_items.includes(value)) {
                      setFormData({
                        ...formData,
                        line_items: [...formData.line_items, value],
                      });
                    }
                  }}
                >
                  <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-left">
                    <ComboboxInput
                      className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white focus:ring-0 bg-white dark:bg-gray-700"
                      displayValue={() => bomLineItemQuery}
                      onChange={e => setBomLineItemQuery(e.target.value)}
                      placeholder="Select BOM items to associate"
                    />
                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </ComboboxButton>
                  </div>
                  <div className="relative w-full">
                    <ComboboxOptions className="absolute z-[200] max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {/* Handle different states: empty list, no matches, and filtered results */}
                      {bomLineItems.length === 0 ? (
                        // Footer section with action buttons
                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                          No BOM items available. Add items in the Bill of Materials tab first.
                        </div>
                      ) : bomLineItems.filter(
                        item =>
                          !formData.line_items.includes(item.id) &&
                          (bomLineItemQuery === "" ||
                            item.line_item_product.name
                              .toLowerCase()
                              .includes(bomLineItemQuery.toLowerCase()))
                      ).length === 0 ? (
                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                          {bomLineItemQuery === ""
                            ? "All BOM items already selected."
                            : "No matching items found."}
                        </div>
                      ) : (
                        // Filter BOM line items by two conditions:
                        // 1. Only show items that haven't been selected yet (!formData.line_items.includes(item.id))
                        // 2. Match search query criteria:
                        //    - If search query is empty, include all unselected items
                        //    - Otherwise only include items whose name contains the search query (case-insensitive)
                        bomLineItems
                          .filter(
                            item =>
                              !formData.line_items.includes(item.id) &&
                              (bomLineItemQuery === "" ||
                                item.line_item_product.name
                                  .toLowerCase()
                                  .includes(bomLineItemQuery.toLowerCase()))
                          )
                          .map(item => (
                            <ComboboxOption
                              key={item.id}
                              value={item.id}
                              className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-white data-focus:bg-red-100 dark:data-focus:bg-red data-hover:bg-gray-100 dark:data-hover:bg-gray-600"
                            >
                              {item.line_item_product.name}
                            </ComboboxOption>
                          ))
                      )}
                    </ComboboxOptions>
                  </div>
                </Combobox>
              </div>
            </div>

            {/* Override Factors Component - allows users to set custom emission factors */}
            <OverrideModal
              // Pass current form data to the override modal
              formData={formData}
              // Cast setFormData function to ensure it accepts FormDataWithOverrideFactors type
              setFormData={setFormData as (a: FormDataWithOverrideFactors) => void}
              // Pass available lifecycle stage options for dropdown selection
              lifecycleChoices={lifecycleChoices}
              // Pass modal visibility state to synchronize component behavior
              isModalOpen={isModalOpen}
              // Pass modal visibility setter to allow child component to control visibility
              setIsModalOpen={setIsModalOpen}
              // Define handler for override factor changes
              onFieldChange={(overrideFactors) => {
                // Adapt the function signature by updating the specific field
                onFieldChange('override_factors', overrideFactors);
              }}
              // Provide empty render function for custom field rendering (not used in this context)
              renderField={(fieldKey: string) => <></>}
            />
          </div>

          {/* Modal Footer with action buttons */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t dark:border-t-gray-700">
            <Button
              onClick={() => Helpers.handleCloseModal(setIsModalOpen, setCurrentEmission)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              // Call API submit handler with all required parameters
              onClick={() =>
                apiCalls.handleSubmit(
                  formData,
                  setIsSubmitting,
                  currentEmission,
                  company_pk,
                  productId,
                  setIsLoading,
                  setEmissions,
                  setIsModalOpen,
                  onFieldChange
                )
              }
              variant="primary"
              disabled={isSubmitting || Helpers.formIncomplete(formData)}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default TransportEmissionModal;