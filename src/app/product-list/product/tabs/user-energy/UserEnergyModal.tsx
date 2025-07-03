"use client";

// Import React and dependencies.
import React from "react";
// Import Headless UI Dialog components
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
// Import close icon from lucide-react
import { X } from "lucide-react";
// Import Button UI component
import Button from "@/app/components/ui/Button";
// Import UserEnergyEmission API type
import { UserEnergyEmission } from "@/lib/api/userEnergyEmissionApi";
// Import EmissionReference API type
import { EmissionReference } from "@/lib/api/emissionReferenceApi";
// Import BOM LineItem API type
import { LineItem } from "@/lib/api/bomApi";
// Import FormData type definition
import { FormData } from "./types";
// Import the UserEnergyForm component
import UserEnergyForm from "./UserEnergyForm";

// Define props for UserEnergyModal component
interface UserEnergyModalProps {
  isOpen: boolean;
  currentEmission: UserEnergyEmission | null;
  formData: FormData;
  setFormData: (formData: FormData) => void;
  references: EmissionReference[];
  bomLineItems: LineItem[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

// UserEnergyModal component definition
export default function UserEnergyModal({
  isOpen,
  currentEmission,
  formData,
  setFormData,
  references,
  bomLineItems,
  isSubmitting,
  onClose,
  onSubmit,
}: UserEnergyModalProps) {
  // Render modal dialog
  return (
    // Modal wrapper
    <Dialog
      open={isOpen}
      as="div"
      className="fixed inset-0 z-20 pt-12 overflow-y-auto"
      onClose={onClose}
      aria-labelledby="user-energy-modal-title"
    >
      <div className="min-h-screen px-4 text-center">
        {/* Backdrop overlay */}
        <div className="fixed inset-0 bg-black/50" />

        {/* Centering hack for vertical alignment */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>

        {/* DialogPanel container for content */}
        <DialogPanel className="relative inline-block w-full max-w-lg p-6 my-8 overflow-visible text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
          {/* Header section with title and close button */}
          <div className="flex justify-between items-center mb-4">
            <DialogTitle
              id="user-energy-modal-title"
              as="h3"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              {currentEmission ? "Edit" : "Add"} User Energy
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close user energy dialog"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Form component for user input */}
          <UserEnergyForm
            formData={formData}
            setFormData={setFormData}
            references={references}
            bomLineItems={bomLineItems}
          />

          {/* Footer with action buttons */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t dark:border-t-gray-700">
            {/* Cancel action button */}
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            {/* Save action button with loading state */}
            <Button
              onClick={onSubmit}
              variant="primary"
              disabled={isSubmitting || !formData.energy_consumption}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
