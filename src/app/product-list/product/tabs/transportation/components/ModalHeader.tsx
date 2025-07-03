import React from 'react';
import { X } from 'lucide-react';
import { DialogTitle } from '@headlessui/react';
import { TransportEmission } from '@/lib/api/transportEmissionApi';

// Props interface for the ModalHeader component
// Defines the emission data and close handler needed for the header
interface ModalHeaderProps {
  currentEmission: TransportEmission | null;
  onClose: () => void;
}

// ModalHeader Component
//
// A reusable header component for modal dialogs that provides a title and close button.
// This component automatically adapts its title text based on whether we're creating
// a new emission or editing an existing one.
//
// Features:
// - Dynamic title that changes based on edit/create mode
// - Accessible close button with proper ARIA labeling
// - Consistent styling with the application's design system
// - Dark mode support with appropriate color variants
// - Proper semantic markup using DialogTitle from HeadlessUI
//
// The component uses the presence of currentEmission to determine the appropriate
// title text, following the common pattern of "Add" vs "Edit" based on whether
// we're working with existing data or creating something new.
const ModalHeader: React.FC<ModalHeaderProps> = ({ currentEmission, onClose }) => {
  return (
    // Header container with flexbox layout for title and close button alignment
    // Provides consistent spacing and positioning for modal header elements
    <div className="flex justify-between items-center mb-4">
      {/* Modal title using HeadlessUI DialogTitle for proper accessibility */}
      {/* Automatically switches between "Add" and "Edit" based on currentEmission */}
      <DialogTitle
        as="h3"
        className="text-lg font-semibold text-gray-900 dark:text-white"
      >
        {currentEmission ? "Edit Transport Emission" : "Add Transport Emission"}
      </DialogTitle>
      
      {/* Close button with accessibility features and hover effects */}
      {/* Uses Lucide X icon and includes proper aria-label for screen readers */}
      <button
        onClick={onClose}
        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900"
        aria-label="Close modal"
      >
        {/* X icon from Lucide with consistent sizing */}
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ModalHeader;