import { apiRequest } from "./apiClient";

export interface Product {
  id: string;
  company_name: string;
  product_name: string;
  sku: string;
  status: string;
  pcf_calculation_method: string;
  pcf_value: string;
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

  // Get a specific product
  getProduct: (companyId: string, productId: string) => apiRequest<Product>(`/companies/${companyId}/products/${productId}/`),

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

  requestProductSharing: (companyId: string, productId: string) =>
    apiRequest<{ id: string }>(`/companies/${companyId}/request_product_sharing/`, {
      method: "POST",
      body: { product_id: productId } as unknown as Record<string, unknown>,
    }),
};
