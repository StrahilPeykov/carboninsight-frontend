import { apiRequest } from "./apiClient";

export interface Product {
  id: string;
  company_name: string;
  name: string;
  sku: string;
  status: string;
  pcf_calculation_method: string;
  emission_total: number;
  reference_impact_unit: string;
}

export interface ProductCreateData {
  company: string;
  product_name: string;
  sku: string;
  description?: string;
  weight?: number;
  material?: string;
}

export interface ProductSharingRequest {
  id: number;
  product_name: string;
  status: "Pending" | "Accepted" | "Rejected";
  created_at: string;
  product: number;
  requester: number;
}

export const productApi = {
  // List products for a company
  listProducts: (companyId: string) => apiRequest<Product[]>(`/companies/${companyId}/products/`),

  // Search products by name for a company
  searchProducts: (companyId: string, searchTerm: string) =>
    apiRequest<Product[]>(
      searchTerm
        ? `/companies/${companyId}/products${searchTerm}`
        : `/companies/${companyId}/products/`
    ),

  // Get a specific product
  getProduct: (companyId: string, productId: string) =>
    apiRequest<Product>(`/companies/${companyId}/products/${productId}/`),

  // Create a new product
  createProduct: (companyId: string, data: ProductCreateData) =>
    apiRequest<Product>(`companies/${companyId}/products/`, {
      method: "POST",
      body: data as unknown as Record<string, unknown>,
    }),

  // Update a product
  updateProduct: (productId: string, companyId: string, data: Partial<ProductCreateData>) =>
    apiRequest<Product>(`companies/${companyId}/products/${productId}/`, {
      method: "PUT",
      body: data as unknown as Record<string, unknown>,
    }),

  // Delete a product
  deleteProduct: (companyId: string, productId: string) =>
    apiRequest(`companies/${companyId}/products/${productId}/`, {
      method: "DELETE",
    }),

  // Data sharing operations
  getProductSharingRequests: (companyId: string) =>
    apiRequest<ProductSharingRequest[]>(`/companies/${companyId}/product_sharing_requests/`),

  approveProductSharingRequests: (companyId: string, ids: string[]) =>
    apiRequest<{ success: boolean }>(
      `/companies/${companyId}/product_sharing_requests/bulk_approve/`,
      {
        method: "POST",
        body: { ids } as unknown as Record<string, unknown>,
      }
    ),

  denyProductSharingRequests: (companyId: string, ids: string[]) =>
    apiRequest<{ success: boolean }>(
      `/companies/${companyId}/product_sharing_requests/bulk_deny/`,
      {
        method: "POST",
        body: { ids } as unknown as Record<string, unknown>,
      }
    ),

  requestProductSharing: (
    providerCompanyId: number,
    requesterCompanyId: number,
    productId: number
  ) =>
    apiRequest<{ id: string }>(
      `/companies/${providerCompanyId}/products/${productId}/request_access/`,
      {
        method: "POST",
        body: { requester: requesterCompanyId } as unknown as Record<string, unknown>,
      }
    ),
};
