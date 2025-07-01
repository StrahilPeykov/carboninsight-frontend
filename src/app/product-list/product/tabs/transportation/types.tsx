// Import types from API models for emission data
import { OverrideFactor } from "@/lib/api";
import { TransportEmission } from "@/lib/api/transportEmissionApi";
// Import UI component for table structure
import { Column } from "@/app/components/ui/OurTable";
// Import type for emission reference data
import { EmissionReference } from "@/lib/api/emissionReferenceApi";
// Import icons for action buttons
import { Edit, Trash } from "lucide-react";
// Import custom button component
import Button from "@/app/components/ui/Button";
// Import helper functions for transportation emissions calculations and operations
import * as Helpers from "./helpers";
// Import types for Bill of Materials data
import { LineItem } from "@/lib/api/bomApi";
// Import lifecycle stage choices for emission categorization
import { LifecycleStageChoice } from "@/lib/api";

// FormData type definition for transportation emission forms
// Contains fields for distance, weight, reference ID, override factors, and associated line items
export type FormData = {
  distance: string;
  weight: string;
  reference: string;
  override_factors: OverrideFactor[];
  line_items: number[];
};

// Factory function that generates table columns for transport emissions
// Takes multiple dependencies to handle various user interactions and state updates
// Returns an array of Column objects configured for TransportEmission data
export const getTransportColumns = (
  references: EmissionReference[],
  setShowOverridesForEmission: (emission: TransportEmission | null) => void,
  setShowBomItemsForEmission: (emission: TransportEmission | null) => void,
  setCurrentEmission: (emission: TransportEmission | null) => void,
  setFormData: (formData: FormData) => void,
  company_pk: number,
  productId: () => number,
  setBomLineItems: (items: LineItem[]) => void,
  setLifecycleChoices: (choices: LifecycleStageChoice[]) => void,
  setReferences: (refs: EmissionReference[]) => void,
  setIsModalOpen: (isOpen: boolean) => void,
  setDeletingEmissionId: (id: number | null) => void,
  setIsDeleteModalOpen: (isOpen: boolean) => void
): Column<TransportEmission>[] => [
  // Reference column - displays the emission reference name or its ID
  // Falls back to a dash if no reference is available
  {
    key: "reference",
    label: "Reference",
    render: (_value, emission) =>
      emission.reference
        ? references.find(ref => ref.id === emission.reference)?.name || emission.reference
        : "—",
  },
  
  // Distance column - displays the transportation distance in kilometers
  {
    key: "distance",
    label: "Distance",
    render: distance => distance + " km",
  },
  
  // Weight column - displays the transported weight in tonnes
  {
    key: "weight",
    label: "Weight",
    render: weight => weight + " tonnes",
  },
  
  // Emission Factor column - displays the combined biogenic and non-biogenic emissions
  // Uses helper function to calculate the total emission factor
  {
    key: "custom emission factor",
    label: "Emission Factor",
    render: (_, emission) => Helpers.sumBioAndNonBioEmissions(emission).toFixed(3),
  },
  
  // Total CO2 column - displays the total transport emissions in kg CO₂e
  // Uses helper function to compute total emissions
  // Shows a dash if calculation results in non-finite value
  {
    key: "total co2",
    label: "Total Transport Emission",
    render: (_: unknown, emission: TransportEmission) => {
      const total = Helpers.computeTotalEmissions(emission);
      return Number.isFinite(total) ? total.toFixed(3) + " kg CO₂e" : "—";
    },
  },
  
  // Overrides column - displays a button to view emission override factors
  // Shows count of overrides in parentheses
  // Shows a dash if no overrides exist
  {
    key: "override_factors",
    label: "Overrides",
    render: (_value, emission) =>
      emission.override_factors && emission.override_factors.length > 0 ? (
        <button
          onClick={() => setShowOverridesForEmission(emission)}
          className="underline hover:cursor-pointer"
        >
          View override{emission.override_factors.length !== 1 ? "s" : ""} (
          {emission.override_factors.length})
        </button>
      ) : (
        "-"
      ),
  },
  
  // BOM items column - displays a button to view associated bill of materials items
  // Shows count of items in parentheses
  // Shows a dash if no items are associated
  {
    key: "line_items",
    label: "BOM items",
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
  
  // Actions column - contains edit and delete buttons for each emission entry
  // Edit button opens a modal with the emission data for editing
  // Delete button triggers a confirmation modal before deletion
  {
    key: "actions",
    label: "Actions",
    render: (_value, emission) => (
      <div className="flex items-center justify-end gap-2">
        <Button
          size="sm"
          className="flex items-center gap-1 text-xs !bg-blue-500 !border-blue-500 !text-white hover:cursor-pointer"
          onClick={e => {
            e.stopPropagation();
            Helpers.handleOpenModal(
              setCurrentEmission,
              setFormData,
              company_pk,
              productId,
              setBomLineItems,
              setLifecycleChoices,
              setReferences,
              setIsModalOpen,
              emission
            );
          }}
        >
          <Edit className="w-4 h-4 text-white" />
        </Button>
        <Button
          size="sm"
          className="flex items-center gap-1 text-xs !bg-red-500 !border-red-500 !text-white hover:cursor-pointer"
          onClick={e => {
            e.stopPropagation();
            Helpers.handleConfirmDelete(setDeletingEmissionId, setIsDeleteModalOpen, emission.id);
          }}
        >
          <Trash className="w-4 h-4 text-white" />
        </Button>
      </div>
    ),
  },
];
