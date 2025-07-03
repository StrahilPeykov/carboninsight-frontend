import React, { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { EmissionReference } from '@/lib/api/emissionReferenceApi';

// Props interface for the ReferenceSelector component
// Defines the selected value, available references, search state, and event handlers
interface ReferenceSelectorProps {
  selectedValue: string;
  references: EmissionReference[];
  referenceQuery: string;
  onReferenceChange: (value: string | null) => void;
  onQueryChange: (value: string) => void;
}

// ReferenceSelector Component
//
// A searchable dropdown component for selecting emission reference factors.
// This component provides a combobox interface that allows users to search through
// available emission references and select one for their transport emission calculation.
//
// Features:
// - Single-select functionality with searchable interface
// - Real-time filtering based on user input
// - Accessible combobox implementation using HeadlessUI
// - Required field validation (indicated by asterisk in label)
// - Dark mode support with appropriate styling
// - Performance optimized filtering with useMemo
//
// The component handles the selection of emission reference factors which are crucial
// for calculating transport emissions. Users can type to filter the list or use
// the dropdown to browse all available options.
const ReferenceSelector: React.FC<ReferenceSelectorProps> = ({
  selectedValue,
  references,
  referenceQuery,
  onReferenceChange,
  onQueryChange,
}) => {
  // Memoized filtered list of references based on search query
  // Only recalculates when references array or query string changes
  // Provides case-insensitive search functionality
  const filteredReferences = useMemo(() => {
    return references.filter(ref =>
      referenceQuery === "" ||
      ref.name.toLowerCase().includes(referenceQuery.toLowerCase())
    );
  }, [references, referenceQuery]);

  return (
    <div>
      {/* Field label with required field indicator (asterisk) */}
      <label
        htmlFor="reference"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Reference Emission Factor *
      </label>
      
      {/* Container for the combobox with relative positioning */}
      <div className="relative">
        {/* HeadlessUI Combobox for accessible dropdown functionality */}
        <Combobox value={selectedValue} onChange={onReferenceChange}>
          {/* Input container with consistent styling and border */}
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-left">
            {/* Search input that displays selected value and handles typing */}
            <ComboboxInput
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white focus:ring-0 bg-white dark:bg-gray-700"
              displayValue={(val: string) => val}
              onChange={e => onQueryChange(e.target.value)}
              placeholder="Select a reference"
            />
            {/* Dropdown button with chevron icon */}
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </ComboboxButton>
          </div>
          
          {/* Dropdown options container with proper positioning */}
          <div className="relative w-full">
            {/* Options list with scrolling and proper z-index for layering */}
            <ComboboxOptions className="absolute z-[200] max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {/* Map through filtered references to create selectable options */}
              {filteredReferences.map(ref => (
                <ComboboxOption
                  key={ref.id}
                  value={ref.name}
                  className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-white data-focus:bg-red-100 dark:data-focus:bg-red data-hover:bg-gray-100 dark:data-hover:bg-gray-600"
                >
                  {/* Display the reference name */}
                  {ref.name}
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          </div>
        </Combobox>
      </div>
    </div>
  );
};

export default ReferenceSelector;