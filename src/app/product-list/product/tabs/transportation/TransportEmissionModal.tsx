import React, { useCallback } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
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
// Custom hook for transport emission form logic
import { useTransportEmissionForm } from "./useTransportEmissionForm";
// Reusable components for form fields and modal layout
import TransportFormFields from "./components/TransportFormFields";
import ReferenceSelector from "./components/ReferenceSelector";
import BomItemSelector from "./components/BomItemSelector";
import ModalHeader from "./components/ModalHeader";
import ModalFooter from "./components/ModalFooter";

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
  // Destructure and rename handlers from custom hook for clarity
  const {
    handleDistanceChange,
    handleWeightChange,
    handleReferenceChange,
    handleBomItemAdd,
    handleBomItemRemove,
    getSelectedReferenceValue,
  } = useTransportEmissionForm(formData, setFormData, references, bomLineItems);

  // Memoized callback to handle modal close action
  const handleClose = useCallback(() => {
    Helpers.handleCloseModal(setIsModalOpen, setCurrentEmission);
  }, [setIsModalOpen, setCurrentEmission]);

  // Memoized callback to handle form submission
  const handleSubmit = useCallback(() => {
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
    );
  }, [
    formData,
    setIsSubmitting,
    currentEmission,
    company_pk,
    productId,
    setIsLoading,
    setEmissions,
    setIsModalOpen,
    onFieldChange,
  ]);

  // Memoized callback to handle override factor changes
  const handleOverrideChange = useCallback((overrideFactors: any) => {
    onFieldChange('override_factors', overrideFactors);
  }, [onFieldChange]);

  return (
    // Main dialog component with backdrop and positioning
    <Dialog
      open={isModalOpen}
      as="div"
      className="fixed inset-0 overflow-y-auto pt-12 z-20"
      onClose={handleClose}
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
          <ModalHeader currentEmission={currentEmission} onClose={handleClose} />

          {/* Form fields container */}
          <div className="space-y-4">
            {/* Transport form fields for distance and weight */}
            <TransportFormFields
              formData={formData}
              onDistanceChange={handleDistanceChange}
              onWeightChange={handleWeightChange}
            />
            
            {/* Reference Emission Factor selector */}
            <ReferenceSelector
              selectedValue={getSelectedReferenceValue()}
              references={references}
              referenceQuery={referenceQuery}
              onReferenceChange={handleReferenceChange}
              onQueryChange={setReferenceQuery}
            />
            
            {/* BOM Line Items selector with multi-select and tags */}
            <BomItemSelector
              formData={formData}
              bomLineItems={bomLineItems}
              bomLineItemQuery={bomLineItemQuery}
              onBomItemAdd={handleBomItemAdd}
              onBomItemRemove={handleBomItemRemove}
              onQueryChange={setBomLineItemQuery}
            />

            {/* Override Factors Component - allows users to set custom emission factors */}
            <OverrideModal
              formData={formData}
              setFormData={setFormData as (a: FormDataWithOverrideFactors) => void}
              lifecycleChoices={lifecycleChoices}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              onFieldChange={handleOverrideChange}
              renderField={(fieldKey: string) => <></>}
            />
          </div>

          {/* Modal Footer with action buttons */}
          <ModalFooter
            isSubmitting={isSubmitting}
            isFormIncomplete={Helpers.formIncomplete(formData)}
            onCancel={handleClose}
            onSubmit={handleSubmit}
          />
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default TransportEmissionModal;