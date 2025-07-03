// Force client-side rendering for modal dialog functionality.
"use client";

import React from "react";
// Import Headless UI components for accessible dialog implementation
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
// Import warning icon for visual indication of destructive action
import { AlertCircle } from "lucide-react";
// Import custom button component with consistent styling
import Button from "@/app/components/ui/Button";

// Props interface for the confirmation dialog
interface DeleteConfirmationModalProps {
  isOpen: boolean;    // Controls modal visibility
  onClose: () => void;  // Handler for cancellation/dismissal
  onConfirm: () => void;  // Handler for deletion confirmation
}

/**
 * Modal dialog for confirming deletion actions
 * Provides clear warning and requires explicit confirmation
 */
export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog
      open={isOpen}
      as="div"
      className="fixed inset-0 z-20 overflow-y-auto"
      onClose={onClose}
      aria-labelledby="delete-user-energy-modal-title"
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
            id="delete-user-energy-modal-title"
            as="h3"
            className="flex items-center gap-3 mb-4 text-red"
          >
            <AlertCircle className="w-6 h-6" aria-hidden="true" />
            <span className="text-lg font-semibold">Confirm Deletion</span>
          </DialogTitle>

          <p className="mb-6">
            Are you sure you want to delete this user energy emission? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              variant="primary"
              className="bg-red hover:bg-red-800 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
