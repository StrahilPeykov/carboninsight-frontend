import React, { useMemo } from 'react';
import { X, ChevronDown } from 'lucide-react';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { FormData } from '../types';
import { LineItem } from '@/lib/api/bomApi';

// Props interface for the BomItemSelector component
// Defines the form data, available items, search state, and event handlers
interface BomItemSelectorProps {
  formData: FormData;
  bomLineItems: LineItem[];
  bomLineItemQuery: string;
  onBomItemAdd: (value: any) => void;
  onBomItemRemove: (itemId: number) => void;
  onQueryChange: (value: string) => void;
}

// BomItemSelector Component
//
// A multi-select component for associating Bill of Materials (BOM) items with transport emissions.
// This component provides a tag-based selection interface where users can search for and select
// multiple BOM items from the available list. Selected items are displayed as removable tags
// above the search input.
//
// Features:
// - Multi-select functionality with tag-based display
// - Real-time search filtering of available items
// - Visual feedback for selected items with remove buttons
// - Handles empty states for both no items available and all items selected
// - Prevents duplicate selections by filtering out already selected items
// - Accessible combobox implementation using HeadlessUI
// - Dark mode support with appropriate styling
//
// The component uses useMemo for performance optimization of the filtered items list
// and provides clear user feedback for different states (empty, filtered, all selected).
const BomItemSelector: React.FC<BomItemSelectorProps> = ({
  formData,
  bomLineItems,
  bomLineItemQuery,
  onBomItemAdd,
  onBomItemRemove,
  onQueryChange,
}) => {
  // Memoized filtered list of BOM items that excludes already selected items
  // and applies search filtering based on the query string
  // This optimization prevents unnecessary recalculations on every render
  const filteredBomItems = useMemo(() => {
    return bomLineItems.filter(
      item =>
        // Exclude items that are already selected
        !formData.line_items.includes(item.id) &&
        // Apply search filter if query exists
        (bomLineItemQuery === "" ||
          item.line_item_product.name
            .toLowerCase()
            .includes(bomLineItemQuery.toLowerCase()))
    );
  }, [bomLineItems, formData.line_items, bomLineItemQuery]);

  // Helper function to render dropdown content based on different states
  // Handles empty states and provides appropriate user feedback messages
  const renderDropdownContent = () => {
    // No BOM items available at all - guide user to add items first
    if (bomLineItems.length === 0) {
      return (
        <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
          No BOM items available. Add items in the Bill of Materials tab first.
        </div>
      );
    }

    // All available items are already selected or search returned no results
    if (filteredBomItems.length === 0) {
      return (
        <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
          {bomLineItemQuery === ""
            ? "All BOM items already selected."
            : "No matching items found."}
        </div>
      );
    }

    // Render the filtered list of available BOM items as selectable options
    return filteredBomItems.map(item => (
      <ComboboxOption
        key={item.id}
        value={item.id}
        className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-white data-focus:bg-red-100 dark:data-focus:bg-red data-hover:bg-gray-100 dark:data-hover:bg-gray-600"
      >
        {item.line_item_product.name}
      </ComboboxOption>
    ));
  };

  return (
    <div>
      {/* Field label with consistent styling */}
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Associated BOM Items
      </label>
      
      {/* Display selected BOM items as removable tags */}
      {/* Only rendered when there are selected items to show */}
      {formData.line_items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.line_items.map(itemId => {
            // Find the full item data for the selected ID
            const item = bomLineItems.find(i => i.id === itemId);
            return (
              // Individual tag for each selected BOM item
              <div
                key={itemId}
                className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-sm flex items-center gap-1"
              >
                {/* Display item name or fallback to ID if item not found */}
                <span>{item ? item.line_item_product.name : `Item #${itemId}`}</span>
                {/* Remove button with hover effect */}
                <button
                  type="button"
                  onClick={() => onBomItemRemove(itemId)}
                  className="text-gray-500 hover:text-red-500"
                >
                  {/* Small X icon for removing the item */}
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Combobox for selecting additional BOM items */}
      <div className="relative">
        {/* Empty value ensures combobox resets after each selection */}
        <Combobox value="" onChange={onBomItemAdd}>
          {/* Input container with consistent styling */}
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-left">
            {/* Search input that shows current query and handles typing */}
            <ComboboxInput
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white focus:ring-0 bg-white dark:bg-gray-700"
              displayValue={() => bomLineItemQuery}
              onChange={e => onQueryChange(e.target.value)}
              placeholder="Select BOM items to associate"
            />
            {/* Dropdown button with chevron icon */}
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </ComboboxButton>
          </div>
          {/* Dropdown options container with proper positioning and styling */}
          <div className="relative w-full">
            <ComboboxOptions className="absolute z-[200] max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {/* Render dropdown content based on current state */}
              {renderDropdownContent()}
            </ComboboxOptions>
          </div>
        </Combobox>
      </div>
    </div>
  );
};

export default BomItemSelector;