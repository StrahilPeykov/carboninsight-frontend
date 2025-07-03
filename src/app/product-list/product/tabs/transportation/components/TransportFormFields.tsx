import React from 'react';
import { FormData } from '../types';

// Props interface for the TransportFormFields component
// Defines the form data and event handlers needed for the input fields
interface TransportFormFieldsProps {
  formData: FormData;
  onDistanceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onWeightChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// TransportFormFields Component
//
// A reusable component that renders the core input fields for transport emission data.
// This component provides the basic numerical inputs required for calculating transport
// emissions: distance and weight.
//
// Features:
// - Two numerical input fields with proper validation constraints
// - Required field indicators with asterisks in labels
// - Consistent styling that matches the application's design system
// - Dark mode support with appropriate color variants
// - Input validation with minimum values and decimal step support
// - Proper accessibility with associated labels and IDs
//
// The component handles the fundamental data entry for transport emissions,
// ensuring users can input accurate distance and weight measurements that
// are essential for emission calculations.
const TransportFormFields: React.FC<TransportFormFieldsProps> = ({
  formData,
  onDistanceChange,
  onWeightChange,
}) => {
  return (
    <>
      {/* Distance input field container */}
      <div>
        {/* Distance field label with required indicator */}
        <label
          htmlFor="distance"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Distance (km) *
        </label>
        {/* Distance input with numerical constraints and validation */}
        <input
          type="number"
          id="distance"
          min="0"  // Prevents negative distances
          step="0.01"  // Allows decimal values with 2 decimal places
          value={formData.distance ?? ""}  // Handles null/undefined values gracefully
          onChange={onDistanceChange}
          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required  // HTML5 validation for required field
        />
      </div>

      {/* Weight input field container */}
      <div>
        {/* Weight field label with required indicator */}
        <label
          htmlFor="weight"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Weight (tonnes) *
        </label>
        {/* Weight input with numerical constraints and validation */}
        <input
          type="number"
          id="weight"
          min="0"  // Prevents negative weights
          step="0.01"  // Allows decimal values with 2 decimal places
          value={formData.weight ?? ""}  // Handles null/undefined values gracefully
          onChange={onWeightChange}
          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required  // HTML5 validation for required field
        />
      </div>
    </>
  );
};

export default TransportFormFields;