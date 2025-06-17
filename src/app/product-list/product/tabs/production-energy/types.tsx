import { OverrideFactor } from "@/lib/api/productionEmissionApi";
import { ProductionEnergyEmission } from "@/lib/api/productionEmissionApi";
import { Column } from "@/app/components/ui/OurTable";
import Button from "@/app/components/ui/Button";
import { Edit, Trash } from "lucide-react";
import * as Helpers from "./helpers";
import { EmissionReference } from "@/lib/api/emissionReferenceApi";
import { LineItem } from "@/lib/api/bomApi";

export type FormData = {
  energy_consumption: string;
  reference: string;
  override_factors: OverrideFactor[];
  line_items: number[];
};

// ── Lifecycle options for override factors ───────────────────
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

export const getProductionEnergyColumns = (
  references: EmissionReference[],
  setShowFactorsForEmission: (emission: ProductionEnergyEmission | null) => void,
  setShowBomItemsForEmission: (emission: ProductionEnergyEmission | null) => void,
  setCurrentEmission: (emission: ProductionEnergyEmission | null) => void,
  setFormData: (formData: FormData) => void,
  company_pk: number,
  productId: () => number,
  setBomLineItems: (items: LineItem[]) => void,
  setIsModalOpen: (isOpen: boolean) => void,
  setDeletingEmissionId: (id: number | null) => void,
  setIsDeleteModalOpen: (isOpen: boolean) => void
): Column<ProductionEnergyEmission>[] => [
  {
    key: "reference",
    label: "Reference",
    render: (_value, emission) =>
      emission.reference
        ? references.find(ref => ref.id === emission.reference)?.name || emission.reference
        : "—",
  },
  {
    key: "energy_consumption",
    label: "Energy Consumption",
    render: (_value, emission) => emission.energy_consumption + " kWh",
  },
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
