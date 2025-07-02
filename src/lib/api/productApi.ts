import { apiRequest } from "./apiClient";
import { OverrideFactor } from "./productionEmissionApi";

/**
 * Interface representing a product in the system
 * Contains all product information including emissions data and metadata
 */
export interface Product {
  id: string; // Unique identifier for the product
  supplier: number; // ID of the supplier company
  supplier_name: string; // Name of the supplier company
  emission_total: number; // Total carbon emissions for the product (kg CO₂-eq)
  emission_total_biogenic: number; // Biogenic carbon emissions component
  emission_total_non_biogenic: number; // Non-biogenic carbon emissions component
  override_factors: OverrideFactor[]; // Custom emission factors that override defaults
  name: string; // Product name/title
  description: string; // Detailed product description
  manufacturer_name: string; // Name of the manufacturing company
  manufacturer_country: string; // Country where product is manufactured
  manufacturer_city: string; // City where product is manufactured
  manufacturer_street: string; // Street address of manufacturer
  manufacturer_zip_code: string; // Postal code of manufacturer
  year_of_construction: number; // Year the product was manufactured
  family: string; // Product family or category
  sku: string; // Stock Keeping Unit identifier
  reference_impact_unit: string; // Unit of measurement for impact calculations
  pcf_calculation_method: string; // Method used for Product Carbon Footprint calculation
  is_public: boolean; // Whether product data is publicly shareable
}

/**
 * Interface for data required to create a new product
 * Contains minimal required fields for product creation
 */
export interface ProductCreateData {
  company: string; // ID of the company creating the product
  product_name: string; // Name of the new product
  sku: string; // Stock Keeping Unit for the product
  description?: string; // Optional product description
  weight?: number; // Optional product weight
  material?: string; // Optional primary material
}

/**
 * Interface representing a product sharing request
 * Used when companies request access to other companies' product emission data
 */
export interface ProductSharingRequest {
  id: number; // Unique identifier for the sharing request
  product_name: string; // Name of the product being requested
  status: "Pending" | "Accepted" | "Rejected"; // Current status of the request
  created_at: string; // ISO timestamp when request was created
  product: number; // ID of the product being requested
  requester: number; // ID of the company making the request
}

/**
 * Interface for system mentions/notifications in emission traces
 * Provides contextual information about calculation quality or issues
 */
interface Mention {
  mention_class: MentionClass; // Severity level of the mention
  message: string; // Human-readable message content
}

// Type definition for mention severity levels
type MentionClass = "Information" | "Warning" | "Error";

/**
 * Type for emission data split between biogenic and non-biogenic sources
 * Used in detailed emission breakdowns
 */
type EmissionSplit = {
  biogenic: number; // Emissions from biological sources (kg CO₂-eq)
  non_biogenic: number; // Emissions from non-biological sources (kg CO₂-eq)
};

/**
 * Interface representing AI-generated advice for a product
 * Contains user prompts and AI responses for emission reduction suggestions
 */
export interface AiAdvice {
  id: number; // Unique identifier for the advice record
  user_prompt: string; // Original user question/prompt
  response: string; // AI-generated response with advice
  created_at: string; // ISO timestamp when advice was generated
}

/**
 * Interface representing detailed emission trace data
 * Provides hierarchical breakdown of product carbon footprint sources
 */
export interface EmissionTrace {
  label: string; // Human-readable label for this emission source
  reference_impact_unit: string; // Unit used for impact calculations
  methodology: string; // Calculation methodology used
  emissions_subtotal: Record<string, EmissionSplit>; // Emissions by lifecycle stage
  children: {
    emission_trace: EmissionTrace; // Nested emission trace for sub-components
    quantity: number; // Quantity of the sub-component used
  }[]; // Array of child emission sources
  mentions: Mention[]; // System notifications about this emission source
  total: number; // Total emissions for this source (kg CO₂-eq)
  source:
    | "Product" // Emissions from the product itself
    | "ProductReference" // Emissions from reference product data
    | "TransportEmission" // Emissions from transportation
    | "TransportEmissionReference" // Reference transport emission data
    | "Material" // Emissions from materials
    | "MaterialReference" // Reference material emission data
    | "UserEnergy" // Emissions from user energy consumption
    | "UserEnergyReference" // Reference user energy data
    | "ProductionEnergy" // Emissions from production energy
    | "ProductionEnergyReference" // Reference production energy data
    | "Other" // Other emission sources
    | "OtherReference"; // Reference data for other sources
  pcf_calculation_method: string; // Method used for PCF calculation
}

/**
 * API client object containing all product-related API operations
 * Provides methods for CRUD operations, data sharing, and AI advice
 */
export const productApi = {
  /**
   * List all products for a specific company
   * @param companyId - ID of the company whose products to retrieve
   * @returns Promise resolving to array of products
   */
  listProducts: (companyId: string) => apiRequest<Product[]>(`/companies/${companyId}/products/`),

  /**
   * Search products by name for a specific company
   * @param companyId - ID of the company to search within
   * @param searchTerm - Search query string
   * @returns Promise resolving to array of matching products
   */
  searchProducts: (companyId: string, searchTerm: string) =>
    apiRequest<Product[]>(
      searchTerm
        ? `/companies/${companyId}/products${searchTerm}` // Include search term if provided
        : `/companies/${companyId}/products/` // List all if no search term
    ),

  /**
   * Get detailed information for a specific product
   * @param companyId - ID of the company that owns the product
   * @param productId - ID of the product to retrieve
   * @returns Promise resolving to product details
   */
  getProduct: (companyId: string, productId: string) =>
    apiRequest<Product>(`/companies/${companyId}/products/${productId}/`),

  /**
   * Get detailed emission trace data for a product
   * Provides hierarchical breakdown of all emission sources
   * @param companyId - ID of the company that owns the product
   * @param productId - ID of the product to analyze
   * @returns Promise resolving to emission trace tree
   */
  getProductEmissionTrace: (companyId: string, productId: string) =>
    apiRequest<EmissionTrace>(`/companies/${companyId}/products/${productId}/emission_traces/`),

  /**
   * Create a new product in the system
   * @param companyId - ID of the company creating the product
   * @param data - Product creation data
   * @returns Promise resolving to created product
   */
  createProduct: (companyId: string, data: ProductCreateData) =>
    apiRequest<Product>(`companies/${companyId}/products/`, {
      method: "POST",
      body: data as unknown as Record<string, unknown>,
    }),

  /**
   * Update an existing product's information
   * @param productId - ID of the product to update
   * @param companyId - ID of the company that owns the product
   * @param data - Partial product data to update
   * @returns Promise resolving to updated product
   */
  updateProduct: (productId: string, companyId: string, data: Partial<ProductCreateData>) =>
    apiRequest<Product>(`companies/${companyId}/products/${productId}/`, {
      method: "PUT",
      body: data as unknown as Record<string, unknown>,
    }),

  /**
   * Delete a product from the system
   * @param companyId - ID of the company that owns the product
   * @param productId - ID of the product to delete
   * @returns Promise resolving when deletion is complete
   */
  deleteProduct: (companyId: string, productId: string) =>
    apiRequest(`companies/${companyId}/products/${productId}/`, {
      method: "DELETE",
    }),

  /**
   * Request AI-generated advice for improving product carbon footprint
   * @param companyId - ID of the company that owns the product
   * @param productId - ID of the product to analyze
   * @param prompt - User question or area of interest for AI advice
   * @returns Promise resolving to AI-generated advice
   */
  requestProductAdvice: (companyId: string, productId: string, prompt: string) =>
    apiRequest<AiAdvice>(
      `/companies/${companyId}/products/${productId}/ai/`,
      {
        method: "POST",
        body: { user_prompt: prompt },
      }
    ),

  /**
   * Export company products in specified format
   * @param companyId - ID of the company whose products to export
   * @param format - Export format (csv, xlsx, aasx, etc.)
   * @param template - Template to use for export formatting
   * @returns Promise resolving to blob data for download
   */
  getExport: (companyId: string, format: string, template: string) =>
    apiRequest<Blob>(
      `/companies/${companyId}/products/export/${format}/?template=${template}`,
      {
        method: "GET",
        responseType: "blob", // Expect binary file data
      }
    ),

  // Data sharing operations for supply chain collaboration

  /**
   * Get all product sharing requests for a company
   * Returns requests from other companies wanting access to this company's products
   * @param companyId - ID of the company to get requests for
   * @returns Promise resolving to array of sharing requests
   */
  getProductSharingRequests: (companyId: string) =>
    apiRequest<ProductSharingRequest[]>(`/companies/${companyId}/product_sharing_requests/`),

  /**
   * Approve multiple product sharing requests in bulk
   * Grants access to requesting companies for specified products
   * @param companyId - ID of the company approving the requests
   * @param ids - Array of sharing request IDs to approve
   * @returns Promise resolving to success confirmation
   */
  approveProductSharingRequests: (companyId: string, ids: string[]) =>
    apiRequest<{ success: boolean }>(
      `/companies/${companyId}/product_sharing_requests/bulk_approve/`,
      {
        method: "POST",
        body: { ids } as unknown as Record<string, unknown>,
      }
    ),

  /**
   * Deny multiple product sharing requests in bulk
   * Rejects access requests from other companies
   * @param companyId - ID of the company denying the requests
   * @param ids - Array of sharing request IDs to deny
   * @returns Promise resolving to success confirmation
   */
  denyProductSharingRequests: (companyId: string, ids: string[]) =>
    apiRequest<{ success: boolean }>(
      `/companies/${companyId}/product_sharing_requests/bulk_deny/`,
      {
        method: "POST",
        body: { ids } as unknown as Record<string, unknown>,
      }
    ),

  /**
   * Request access to another company's product emission data
   * Creates a sharing request that the provider company can approve/deny
   * @param providerCompanyId - ID of the company that owns the product
   * @param requesterCompanyId - ID of the company requesting access
   * @param productId - ID of the product to request access to
   * @returns Promise resolving to created request details
   */
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
