import { Column } from "@/app/components/ui/OurTable";
import Button from "@/app/components/ui/Button";
import * as Helpers from "./helpers";
import { Edit, Trash, Info, Clock, EyeOff } from "lucide-react";

// ── Material type for table rows ───────────────────────────────
export type Material = {
  id: number;
  productName: string;
  manufacturerName: string;
  supplierName: string;
  quantity: number;
  emission_total: number;
  supplierId: number;
  productId: number;
  product_sharing_request_status: "Pending" | "Accepted" | "Rejected" | "Not requested";
  reference_impact_unit: string;
};

export const getBomColumns = (
  materials: Material[],
  company_pk: number,
  setEditingMaterial: (material: Material | null) => void,
  setNewQuantity: (quantity: string) => void,
  setIsEditModalOpen: (isOpen: boolean) => void,
  setDeleteMaterial: (material: Material | null) => void,
  setIsDeleteModalOpen: (isOpen: boolean) => void,
  setMaterials: (materials: Material[]) => void
): Column<Material>[] => [
  {
    key: "productName",
    label: "Product Name",
  },
  {
    key: "manufacturerName",
    label: "Manufacturer",
  },
  {
    key: "supplierName",
    label: "Supplier",
  },
  {
    key: "quantity",
    label: "Quantity",
    render: (_value, material) => material.quantity + " " + material.reference_impact_unit,
  },
  {
    key: "product_sharing_request_status",
    label: "Total Emission",
    render: (status, material) => {
      switch (status) {
        case "Accepted":
          return (
            <span className="flex items-center gap-1">
              {material.emission_total} kg
              <button
                onClick={e => {
                  e.stopPropagation();
                  Helpers.handleInfoClick(materials, material.id);
                }}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-0.5 hover:cursor-pointer"
              >
                <Info className="w-4 h-4 text-gray-400" />
              </button>
            </span>
          );
        case "Pending":
          return (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-yellow-500" />
              Pending
            </span>
          );
        case "Rejected":
          return (
            <span className="flex items-center gap-1">
              <EyeOff className="w-4 h-4 text-red-500" />
              Access denied
            </span>
          );
        case "Not requested":
          return (
            <button
              onClick={e => {
                e.stopPropagation();
                Helpers.handleRequestAccess(materials, company_pk, setMaterials, material.id);
              }}
              className="text-xs bg-red hover:bg-red-800 text-white px-2 py-1 rounded hover:cursor-pointer"
            >
              Request access
            </button>
          );
      }
    },
  },
  {
    key: "actions",
    label: "Actions",
    render: (_value, material) => (
      <div className="flex items-center justify-end gap-2">
        <Button
          size="sm"
          className="flex items-center gap-1 text-xs !bg-blue-500 !border-blue-500 !text-white hover:cursor-pointer"
          onClick={e => {
            e.stopPropagation();
            Helpers.handleEdit(
              materials,
              setEditingMaterial,
              setNewQuantity,
              setIsEditModalOpen,
              material.id
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
            Helpers.openDeleteModal(setDeleteMaterial, setIsDeleteModalOpen, material);
          }}
        >
          <Trash className="w-4 h-4 text-white" />
        </Button>
      </div>
    ),
  },
];
