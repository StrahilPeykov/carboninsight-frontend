import { Company } from "@/lib/api/companyApi";
import { Product, productApi } from "@/lib/api/productApi";
import { Material } from "./types";

// ── Add material (open modal) ────────────────
export const handleAddMaterial = (
  setIsModalOpen: (a: boolean) => void,
  setCurrentStep: (a: number) => void,
  setSelectedCompany: (a: Company | null) => void,
  setSelectedProduct: (a: Product | null) => void,
  setQuantity: (a: string) => void,
  setSearchCompany: (a: string) => void,
  setSearchProduct: (a: string) => void
) => {
  setIsModalOpen(true);
  setCurrentStep(1);
  setSelectedCompany(null);
  setSelectedProduct(null);
  setQuantity("1");
  setSearchCompany("");
  setSearchProduct("");
};

// ── Modal step 1: Select company ───────────────────────────
export const handleSelectCompany = (
  setSelectedCompany: (a: Company | null) => void,
  setCurrentStep: (a: number) => void,
  setSearchProduct: (a: string) => void,
  setProducts: (a: Product[]) => void,
  company: Company
) => {
  setSelectedCompany(company);
  setCurrentStep(2);
  setSearchProduct("");
  setProducts([]);
};

// Editing the quantity of a material
export const handleEdit = (
  materials: Material[],
  setEditingMaterial: (a: Material | null) => void,
  setNewQuantity: (a: string) => void,
  setIsEditModalOpen: (a: boolean) => void,
  id: number
) => {
  const foundMaterial = materials.find((m: Material) => m.id === id);
  if (foundMaterial) {
    setEditingMaterial(foundMaterial);
    setNewQuantity(foundMaterial.quantity.toString());
    setIsEditModalOpen(true);
  }
};

// ── Info button: open emissions tree in new tab ─────────────
export const handleInfoClick = (materials: Material[], materialId: number) => {
  const material = materials.find(m => m.id === materialId);
  if (material) {
    window.open(
      `/product-list/emissions-tree?cid=${material.supplierId}&id=${material.productId}`,
      "_blank"
    );
  }
};

// ── Request access to a material's emissions ────────────────
export const handleRequestAccess = async (
  materials: Material[],
  company_pk: number,
  setMaterials: (a: Material[]) => void,
  materialId: number
) => {
  const material = materials.find(m => m.id === materialId);
  if (material) {
    try {
      await productApi.requestProductSharing(material.supplierId, company_pk, material.productId);
      const updatedMaterials = materials.map(m => {
        if (m.id === materialId) {
          return {
            ...m,
            product_sharing_request_status: "Pending" as const,
          };
        }
        return m;
      });
      setMaterials(updatedMaterials);
    } catch (error) {
      console.error("Error adding material:", error);
    }
  }
};

// ── Modal close helpers ─────────────────────────────────────
export const closeModal = (
  setIsModalOpen: (a: boolean) => void,
  setAddMaterialError: (a: string | null) => void,
  setCurrentStep: (a: number) => void,
  setSelectedCompany: (a: Company | null) => void,
  setSelectedProduct: (a: Product | null) => void,
  setQuantity: (a: string) => void,
  setIsEstimationMode: (a: boolean) => void
) => {
  setIsModalOpen(false);
  setAddMaterialError(null);
  setCurrentStep(1);
  setSelectedCompany(null);
  setSelectedProduct(null);
  setQuantity("1");
  setIsEstimationMode(false);
};

// ── Delete modal helpers ────────────────────────────────────
export function openDeleteModal(
  setDeleteMaterial: (a: Material | null) => void,
  setIsDeleteModalOpen: (a: boolean) => void,
  item: Material
) {
  setDeleteMaterial(item);
  setIsDeleteModalOpen(true);
}
export function closeDeleteModal(
  setDeleteMaterial: (a: Material | null) => void,
  setIsDeleteModalOpen: (a: boolean) => void
) {
  setDeleteMaterial(null);
  setIsDeleteModalOpen(false);
}
