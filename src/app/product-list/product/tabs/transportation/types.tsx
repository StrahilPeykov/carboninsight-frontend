import { OverrideFactor } from "@/lib/api";
import { TransportEmission } from "@/lib/api/transportEmissionApi";
import { Column } from "@/app/components/ui/OurTable";
import { EmissionReference } from "@/lib/api/emissionReferenceApi";
import { Edit, Trash } from "lucide-react";
import Button from "@/app/components/ui/Button";
import * as Helpers from "./helpers";
import { LineItem } from "@/lib/api/bomApi";
import { LifecycleStageChoice } from "@/lib/api";

export type FormData = {
  distance: string;
  weight: string;
  reference: string;
  override_factors: OverrideFactor[];
  line_items: number[];
};

// This is a factory function that returns the columns with proper dependencies
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
  {
    key: "reference",
    label: "Reference",
    render: (_value, emission) =>
      emission.reference
        ? references.find(ref => ref.id === emission.reference)?.name || emission.reference
        : "—",
  },
  {
    key: "distance",
    label: "Distance",
    render: distance => distance + " km",
  },
  {
    key: "weight",
    label: "Weight",
    render: weight => weight + " tonnes",
  },
  {
    key: "custom emission factor",
    label: "Emission Factor",
    render: (_, emission) => Helpers.sumBioAndNonBioEmissions(emission).toFixed(3),
  },
  {
    key: "total co2",
    label: "Total Transport Emission",
    render: (_: unknown, emission: TransportEmission) => {
      const total = Helpers.computeTotalEmissions(emission);
      return Number.isFinite(total) ? total.toFixed(3) + " kg CO₂e" : "—";
    },
  },
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
