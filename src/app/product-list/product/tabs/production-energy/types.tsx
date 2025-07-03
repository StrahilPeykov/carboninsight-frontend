// Type definitions and table column configuration for production energy emissions
// Provides centralized type safety and UI component definitions for emission management
// Includes lifecycle stage options based on ISO 14040/14044 LCA standards

// Override factor type for custom emission calculations deviating from standard references
import { OverrideFactor } from "@/lib/api/productionEmissionApi";
// Production energy emission data structure with calculations and metadata
import { ProductionEnergyEmission } from "@/lib/api/productionEmissionApi";
// Table column interface for consistent data grid implementation
import { Column } from "@/app/components/ui/OurTable";
// Custom button component with standardized styling and interaction patterns
import Button from "@/app/components/ui/Button";
// Lucide icons for edit and delete actions with universal recognition
import { Edit, Trash } from "lucide-react";
// Helper functions for modal operations and form state management
import * as Helpers from "./helpers";
// Emission reference type for standardized carbon intensity factors
import { EmissionReference } from "@/lib/api/emissionReferenceApi";
// Bill of Materials line item type for component-level energy attribution
import { LineItem } from "@/lib/api/bomApi";

// Form data interface for production energy emission input forms
// Ensures type safety across form operations and API data transformation
// String types accommodate form input requirements while maintaining data integrity
export type FormData = {
  // Energy consumption value as string for form input compatibility
  energy_consumption: string;
  // Reference database ID as string for dropdown selection handling
  reference: string;
  // Array of custom override factors for specialized emission calculations
  override_factors: OverrideFactor[];
  // Array of BOM line item IDs for component-level energy attribution
  line_items: number[];
};

// Comprehensive lifecycle stage options based on ISO 14040/14044 LCA methodology
// Covers complete product lifecycle from raw material extraction to end-of-life
// Enables precise carbon footprint attribution across all lifecycle phases
// ── Lifecycle options for override factors ───────────────────
export const lifecycleOptions = [
  // A-phases: Product stage (cradle-to-gate)
  "A1 - Raw material supply (and upstream production)",
  "A2 - Cradle-to-gate transport to factory",
  "A3 - A3 - Production",
  "A4 - Transport to final destination",
  "A5 - Installation",
  // Combined A-phases for simplified reporting
  "A1-A3 - Raw material supply and production",
  "A4-A5 - Transport to final destination and installation",
  // B-phases: Use stage (operational impacts)
  "B1 - Usage phase",
  "B2 - Maintenance",
  "B3 - Repair",
  "B4 - Replacement",
  "B5 - Update/upgrade, refurbishing",
  "B6 - Operational energy use",
  "B7 - Operational water use",
  // Combined B-phases for complete use stage assessment
  "B1-B7 - Entire usage phase",
  // C-phases: End-of-life stage (disposal and waste management)
  "C1 - Reassembly",
  "C2 - Transport to recycler",
  "C3 - Recycling, waste treatment",
  "C4 - Landfill",
  // Combined C-phases for end-of-life impact assessment
  "C1-C4 - Decommissioning",
  "C2-C4 - Transport to recycler and landfill",
  // D-phase: Benefits and loads beyond system boundary
  "D - Reuse",
  // Catch-all for non-standard or emerging lifecycle considerations
  "Other",
];

// Table column configuration factory function for production energy emissions data grid
// Creates standardized column definitions with interactive elements and data formatting
// Handles complex rendering logic for references, overrides, BOM items, and actions
export const getProductionEnergyColumns = (
  // Available emission references for name resolution and display
  references: EmissionReference[],
  // State setter for displaying override factors in dedicated modal
  setShowFactorsForEmission: (emission: ProductionEnergyEmission | null) => void,
  // State setter for displaying associated BOM items in dedicated modal
  setShowBomItemsForEmission: (emission: ProductionEnergyEmission | null) => void,
  // State setter for setting current emission in edit mode
  setCurrentEmission: (emission: ProductionEnergyEmission | null) => void,
  // State setter for populating form data during edit operations
  setFormData: (formData: FormData) => void,
  // Company primary key for multi-tenant operations
  company_pk: number,
  // Dynamic product ID function for context-aware operations
  productId: () => number,
  // State setter for loading BOM items during edit operations
  setBomLineItems: (items: LineItem[]) => void,
  // State setter for controlling modal visibility
  setIsModalOpen: (isOpen: boolean) => void,
  // State setter for tracking emission targeted for deletion
  setDeletingEmissionId: (id: number | null) => void,
  // State setter for controlling delete confirmation modal
  setIsDeleteModalOpen: (isOpen: boolean) => void
): Column<ProductionEnergyEmission>[] => [
  {
    key: "reference",
    label: "Reference",
    // Resolve reference ID to human-readable name from references array
    // Display fallback for missing references or show dash for no reference
    render: (_value, emission) =>
      emission.reference
        ? references.find(ref => ref.id === emission.reference)?.name || emission.reference
        : "—",
  },
  {
    key: "energy_consumption",
    label: "Energy Consumption",
    // Format energy consumption with unit label for clear data presentation
    render: (_value, emission) => emission.energy_consumption + " kWh",
  },
  {
    key: "override_factors",
    label: "Overrides",
    // Interactive button for viewing override factors when present
    // Handles singular/plural grammar and displays count for user awareness
    render: (_value, emission) =>
      emission.override_factors && emission.override_factors.length > 0 ? (
        <button
          onClick={() => setShowFactorsForEmission(emission)}
          className="underline hover:cursor-pointer"
        >
          View override{emission.override_factors.length !== 1 ? "s" : ""} (
          {emission.override_factors.length})
        </button>
      ) : (
        "-"
      ),
  },
  {
    key: "line_items",
    label: "BOM items",
    // Interactive button for viewing associated BOM items when present
    // Prevents event bubbling and handles singular/plural display logic
    render: (_value, emission) =>
      emission.line_items && emission.line_items.length > 0 ? (
        <button
          onClick={e => {
            e.stopPropagation();
            setShowBomItemsForEmission(emission);
          }}
          className="underline hover:cursor-pointer"
        >
          View item{emission.line_items.length !== 1 ? "s" : ""} ({emission.line_items.length})
        </button>
      ) : (
        "-"
      ),
  },
  {
    key: "actions",
    label: "Actions",
    // Action buttons for edit and delete operations with consistent styling
    // Event propagation prevention ensures proper modal handling
    render: (_value, emission) => (
      <div className="flex items-center justify-end gap-2">
        {/* Edit button with blue styling and helper function integration */}
        <Button
          size="sm"
          className="flex items-center gap-1 text-xs !bg-blue-500 !border-blue-500 !text-white hover:cursor-pointer"
          onClick={e => {
            e.stopPropagation();
            // Open modal in edit mode with current emission data
            Helpers.handleOpenModal(
              setCurrentEmission,
              setFormData,
              company_pk,
              productId,
              setBomLineItems,
              setIsModalOpen,
              emission
            );
          }}
        >
          <Edit className="w-4 h-4 text-white" />
        </Button>
        {/* Delete button with red styling and confirmation workflow */}
        <Button
          size="sm"
          className="flex items-center gap-1 text-xs !bg-red-500 !border-red-500 !text-white hover:cursor-pointer"
          onClick={e => {
            e.stopPropagation();
            // Trigger delete confirmation modal with emission ID
            Helpers.handleConfirmDelete(setDeletingEmissionId, setIsDeleteModalOpen, emission.id);
          }}
        >
          <Trash className="w-4 h-4 text-white" />
        </Button>
      </div>
    ),
  },
];
