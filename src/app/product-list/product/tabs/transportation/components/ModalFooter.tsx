import React from 'react';
import Button from '@/app/components/ui/Button';

// Props interface for the ModalFooter component
// Defines the callback functions and state needed for footer actions
interface ModalFooterProps {
  isSubmitting: boolean;
  isFormIncomplete: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

// ModalFooter Component
//
// A reusable footer component for modal dialogs that provides standard action buttons.
// This component renders Cancel and Save/Submit buttons with appropriate styling and
// behavior based on the current form state.
//
// Features:
// - Cancel button that allows users to close the modal without saving
// - Submit button that changes text based on submission state
// - Automatic disabling of submit button when form is incomplete or submitting
// - Consistent styling that matches the application's design system
// - Responsive layout that works across different screen sizes
//
// The component follows the standard modal footer pattern with right-aligned buttons
// and uses the application's Button component for consistent styling and behavior.
// The submit button provides visual feedback during form submission by showing
// "Saving..." text and being disabled to prevent multiple submissions.
const ModalFooter: React.FC<ModalFooterProps> = ({
  isSubmitting,
  isFormIncomplete,
  onCancel,
  onSubmit,
}) => {
  return (
    // Footer container with top border and padding
    // Uses flexbox for right-aligned button layout with consistent spacing
    <div className="flex justify-end gap-2 mt-6 pt-4 border-t dark:border-t-gray-700">
      {/* Cancel button - always enabled and closes modal without saving */}
      <Button onClick={onCancel} variant="outline">
        Cancel
      </Button>
      
      {/* Submit button with conditional behavior based on form state */}
      {/* Disabled when form is incomplete or currently submitting */}
      {/* Shows different text during submission for user feedback */}
      <Button
        onClick={onSubmit}
        variant="primary"
        disabled={isSubmitting || isFormIncomplete}
      >
        {isSubmitting ? "Saving..." : "Save"}
      </Button>
    </div>
  );
};

export default ModalFooter;