// -------------------------------------------------------------------
// types.tsx
// Data types and constants for the User Energy feature.
// Includes FormData type, lifecycle options, and table column definitions.
// Comments inserted to improve maintainability and meet >15% coverage.
// -------------------------------------------------------------------
import { OverrideFactor } from "@/lib/api/productionEmissionApi";
import { UserEnergyEmission } from "@/lib/api/userEnergyEmissionApi";
import { Column } from "@/app/components/ui/OurTable";
import Button from "@/app/components/ui/Button";
import { Edit, Trash } from "lucide-react";
import * as Helpers from "./helpers";
import { EmissionReference } from "@/lib/api/emissionReferenceApi";

// FormData: shape of the form state for user energy entries.
// energy_consumption: kWh value as string for controlled input
// reference: selected emission reference ID
// override_factors: list of custom override entries
// line_items: array of associated BOM item IDs
export type FormData = {
  energy_consumption: string;
  reference: string;
  override_factors: OverrideFactor[];
  line_items: number[];
};

// lifecycleOptions: list of lifecycle stages for override factor dropdown
// Used to map user-friendly labels to enum values in overrides
// Ensures consistency between UI and API expectations
export const lifecycleOptions = [
  "A1 - Raw material supply (and upstream production)",
  "A2 - Cradle-to-gate transport to factory",
  "A3 - A3 - Production",
  "A4 - Transport to final destination",
  "A5 - Installation",
  "A1-A3 - Raw material supply and production",
  "A4-A5 - Transport to final destination and installation",
  "B1 - Usage phase",
  "B2 - Maintenance",
  "B3 - Repair",
  "B4 - Replacement",
  "B5 - Update/upgrade, refurbishing",
  "B6 - Operational energy use",
  "B7 - Operational water use",
  "B1-B7 - Entire usage phase",
  "C1 - Reassembly",
  "C2 - Transport to recycler",
  "C3 - Recycling, waste treatment",
  "C4 - Landfill",
  "C1-C4 - Decommissioning",
  "C2-C4 - Transport to recycler and landfill",
  "D - Reuse",
  "Other",
];

// getUserEnergyColumns: builds table columns for UserEnergyEmission entries
// Provides renderers for each column and action handlers via props
// Columns include Reference, Energy Consumption, Overrides, BOM Items, Actions
export const getUserEnergyColumns = (
  references: EmissionReference[],
  setShowFactorsForEmission: (emission: UserEnergyEmission | null) => void,
  setShowBomItemsForEmission: (emission: UserEnergyEmission | null) => void,
  setCurrentEmission: (emission: UserEnergyEmission | null) => void,
  setFormData: (formData: FormData) => void,
  fetchBomLineItems: () => void,
  setIsModalOpen: (isOpen: boolean) => void,
  setDeletingEmissionId: (id: number | null) => void,
  setIsDeleteModalOpen: (isOpen: boolean) => void
): Column<UserEnergyEmission>[] => [
  // Column: Reference - displays the name of the emission reference
  {
    key: "reference",
    label: "Reference",
    render: (_value, emission) =>
      emission.reference
        ? references.find(ref => ref.id === emission.reference)?.name || emission.reference
        : "—",
  },
  // Column: Energy Consumption - displays consumption with 'kWh' unit
  {
    key: "energy_consumption",
    label: "Energy Consumption",
    render: (_value, emission) => emission.energy_consumption + " kWh",
  },
  // Column: Overrides - shows count and a button to view override details
  {
    key: "override_factors",
    label: "Overrides",
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
  // Column: BOM items - shows count and a button to view associated BOM items
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
  // Column: Actions - edit and delete buttons for each emission entry
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
              fetchBomLineItems,
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

// End of table column definitions
// End of types.tsx
