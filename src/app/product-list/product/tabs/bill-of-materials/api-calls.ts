import { bomApi, LineItem } from "@/lib/api/bomApi";
import { companyApi, Company } from "@/lib/api/companyApi";
import { productApi, Product } from "@/lib/api/productApi";
import { Material } from "./types";
import { closeDeleteModal } from "@/app/product-list/product/tabs/bill-of-materials/helpers";
import { ApiError } from "@/lib/api";

// ── Fetch all BoM items from API ────────────────────────────
export const fetchBOMItems = async (
  company_pk: number,
  productId: () => number,
  setMaterials: (a: Material[]) => void
) => {
  try {
    const data = await bomApi.getAllLineItems(company_pk, productId());

    const transformedMaterials: Material[] = data.map((item: LineItem) => ({
      id: item.id,
      productName: item.line_item_product.name,
      manufacturerName: item.line_item_product.manufacturer_name || "Unknown",
      supplierName: item.line_item_product.supplier_name || "Unknown",
      quantity: item.quantity,
      emission_total: parseFloat(
        (item.line_item_product.emission_total * item.quantity).toFixed(2)
      ),
      supplierId: item.line_item_product.supplier,
      productId: item.line_item_product.id,
      product_sharing_request_status: item.product_sharing_request_status,
      reference_impact_unit: item.line_item_product.reference_impact_unit,
    }));

    setMaterials(transformedMaterials);
  } catch (error) {
    console.error("Error fetching BoM items:", error);
  }
};

// ── Fetch companies for step 1 ──────────────────────────────
export const fetchCompanies = async (
  setIsLoading: (a: boolean) => void,
  setCompanies: (a: Company[]) => void,
  search = ""
) => {
  setIsLoading(true);
  try {
    const searchParam = search.length >= 4 ? `?search=${encodeURIComponent(search)}` : "";

    const data = await companyApi.searchAllCompanies(searchParam);
    setCompanies(data);
  } catch (error) {
    console.error("Error fetching companies:", error);
    setCompanies([]);
  } finally {
    setIsLoading(false);
  }
};

// ── Fetch products for selected company ─────────────────────
export const fetchProducts = async (
  setIsLoading: (a: boolean) => void,
  setProducts: (a: Product[]) => void,
  companyId: string,
  search = ""
) => {
  if (!companyId) return;
  setIsLoading(true);
  try {
    const searchParam = search.length >= 4 ? `?search=${encodeURIComponent(search)}` : "";

    const data = await productApi.searchProducts(companyId, searchParam);
    setProducts(data);
  } catch (error) {
    console.error("Error fetching products:", error);
    setProducts([]);
  } finally {
    setIsLoading(false);
  }
};

// ── Update quantity for a material ─────────────────────────
export const handleUpdateQuantity = async (
  newQuantity: string,
  editingMaterial: Material,
  company_pk: number,
  productId: () => number,
  materials: Material[],
  setMaterials: (a: Material[]) => void,
  setIsEditModalOpen: (a: boolean) => void,
  setEditingMaterial: (a: Material | null) => void,
  onFieldChange: () => void
) => {
  const parsedQuantity = parseFloat(newQuantity);
  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    alert("Please enter a valid quantity greater than 0");
    return;
  }

  if (!editingMaterial) {
    return;
  }

  try {
    await bomApi.updateLineItem(company_pk, productId(), editingMaterial.id, {
      quantity: parsedQuantity,
      line_item_product_id: undefined,
    });

    const updatedMaterials = materials.map(material => {
      if (material.id === editingMaterial.id) {
        return {
          ...material,
          quantity: parsedQuantity,
          emission_total: parseFloat(
            ((material.emission_total / material.quantity) * parsedQuantity).toFixed(2)
          ),
        };
      }
      return material;
    });

    setMaterials(updatedMaterials);
    setIsEditModalOpen(false);
    setEditingMaterial(null);
    onFieldChange();
  } catch (error) {
    console.error("Error updating material:", error);
  }
};

// ── Modal step 2: Add product to BoM ───────────────────────
export const handleAddProduct = async (
  setAddMaterialError: (a: string | null) => void,
  quantity: string,
  selectedProduct: Product | null,
  selectedCompany: Company | null,
  company_pk: number,
  productId: () => number,
  materials: Material[],
  setMaterials: (a: Material[]) => void,
  setIsModalOpen: (a: boolean) => void,
  onFieldChange: () => void
) => {
  setAddMaterialError(null);

  const parsedQuantity = parseFloat(quantity);
  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    alert("Please enter a valid quantity greater than 0");
    return;
  }

  if (selectedProduct && selectedCompany) {
    try {
      const responseData = await bomApi.createNewLineItem(company_pk, productId(), {
        quantity: parsedQuantity,
        line_item_product_id: parseInt(selectedProduct.id),
      });

      const newMaterial = {
        id: responseData.id,
        productName: selectedProduct.name,
        manufacturerName: selectedCompany.name || "Unknown",
        supplierName: selectedProduct.supplier_name || "Unknown",
        quantity: parsedQuantity,
        emission_total: parseFloat((selectedProduct.emission_total * parsedQuantity).toFixed(2)),
        supplierId: parseInt(selectedCompany.id),
        productId: parseInt(selectedProduct.id),
        product_sharing_request_status: responseData.product_sharing_request_status,
        reference_impact_unit: selectedProduct.reference_impact_unit,
      };

      const updatedMaterials = [...materials, newMaterial];
      setMaterials(updatedMaterials);
      setIsModalOpen(false);
      onFieldChange();
    } catch (error: unknown) {
      console.error("Error adding material:", error);

      let errorMessage = "An error occurred while adding the material.";

      if (error instanceof ApiError && error.data) {
        const errorData = error.data as any;

        // Check if the error has the expected structure with multiple errors
        if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          if (errorData.errors.length === 1) {
            // Single error case
            const firstError = errorData.errors[0];
            if (firstError?.detail) {
              errorMessage = firstError.detail;
            }
          } else {
            // Multiple errors case - join all details with a space
            const errorDetails = errorData.errors
              .map((err: {detail: string}) => err.detail)
              .filter((detail: string) => detail)
              .join(" ");

            if (errorDetails) {
              errorMessage = errorDetails;
            }
          }
        } else if (typeof errorData?.detail === 'string') {
          // Handle direct detail property
          errorMessage = errorData.detail;
        }
      }

      setAddMaterialError(errorMessage);
    }
  }
};

export async function confirmDelete(
  deleteMaterial: Material | null,
  company_pk: number,
  productId: () => number,
  setMaterials: (a: Material[] | ((prev: Material[]) => Material[])) => void,
  onFieldChange: () => void,
  setDeleteMaterial: (a: Material | null) => void,
  setIsDeleteModalOpen: (a: boolean) => void
) {
  if (!deleteMaterial) return;

  try {
    await bomApi.deleteLineItem(company_pk, productId(), deleteMaterial.id);
    // update list and notify parent
    setMaterials((mats: Material[]) => mats.filter((m: Material) => m.id !== deleteMaterial.id));
    onFieldChange();
  } catch (e) {
    console.error("Delete failed", e);
  } finally {
    closeDeleteModal(setDeleteMaterial, setIsDeleteModalOpen);
  }
}

// ── Handle estimation mode for reference company ────────────
export const handleEstimationButton = async (
  setIsEstimationMode: (a: boolean) => void,
  setSelectedCompany: (a: Company | null) => void,
  setCurrentStep: (a: number) => void,
  setSearchProduct: (a: string) => void
) => {
  try {
    const referenceCompany = await companyApi.getCompany("reference");

    setIsEstimationMode(true);
    setSelectedCompany(referenceCompany);
    setCurrentStep(2);
    setSearchProduct("");
  } catch (error) {
    console.error("Error fetching reference company:", error);
    setIsEstimationMode(true);
    setSelectedCompany({
      id: "reference",
      name: "Reference Database",
      vat_number: "",
      business_registration_number: "",
    });
    setCurrentStep(2);
    setSearchProduct("");
  }
};
