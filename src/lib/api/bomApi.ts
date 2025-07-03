/**
 * Bill of Materials (BOM) API client
 * Manages product line items and their associated emission calculations
 */

import { apiRequest } from "./apiClient";

// Types for different emission calculation categories
type EmissionType =
  | "TransportEmission"
  | "MaterialEmission"
  | "UserEnergyEmission"
  | "ProductionEnergyEmission";

// Status types for product sharing requests
type Status = "Pending" | "Accepted" | "Rejected" | "Not requested";

// Interface for emission calculations associated with line items
interface Emission {
  id: number;
  quantity: number;
  type: EmissionType;
  url: string | null;
}

// Interface representing a product used in BOM line items
interface Product {
  id: number;
  supplier: number;
  emission_total: number;
  name: string;
  description: string;
  manufacturer_name: string;
  supplier_name: string;
  sku: string;
  is_public: boolean;
  reference_impact_unit: string;
}

// Interface representing a line item in a Bill of Materials
export interface LineItem {
  id: number;
  quantity: number;
  line_item_product: Product;
  parent_product: number;
  calculate_emissions?: Emission[];
  product_sharing_request_status: Status;
}

// Interface for creating new line items
export interface CreateLineItemData {
  quantity: number;
  line_item_product_id: number;
}

// Interface for updating existing line items
export interface UpdateLineItemData {
  quantity?: number;
  line_item_product_id?: number;
}

/**
 * Bill of Materials API endpoints
 * Provides methods for managing product line items and their components
 */
export const bomApi = {
  /**
   * Get all line items for a specific product's BOM
   * @param company_id - ID of the company owning the product
   * @param product_id - ID of the product to get line items for
   * @returns Promise resolving to array of line items
   */
  getAllLineItems: (company_id: number, product_id: number) =>
    apiRequest<LineItem[]>(`/companies/${company_id}/products/${product_id}/bom/`, {
      method: "GET",
    }),

  /**
   * Create a new line item in a product's BOM
   * @param company_id - ID of the company owning the product
   * @param product_id - ID of the product to add line item to
   * @param data - Line item creation data
   * @returns Promise resolving to created line item
   */
  createNewLineItem: (company_id: number, product_id: number, data: CreateLineItemData) =>
    apiRequest<LineItem>(`/companies/${company_id}/products/${product_id}/bom/`, {
      method: "POST",
      body: data as unknown as Record<string, unknown>,
    }),

  /**
   * Get details of a specific line item
   * @param company_id - ID of the company owning the product
   * @param product_id - ID of the product containing the line item
   * @param line_item_id - ID of the specific line item
   * @returns Promise resolving to line item details
   */
  getLineItem: (company_id: number, product_id: number, line_item_id: number) =>
    apiRequest<LineItem>(`/companies/${company_id}/products/${product_id}/bom/${line_item_id}/`, {
      method: "GET",
    }),

  /**
   * Update an existing line item
   * Uses PUT for full updates or PATCH for partial updates
   * @param company_id - ID of the company owning the product
   * @param product_id - ID of the product containing the line item
   * @param line_item_id - ID of the line item to update
   * @param data - Updated line item data
   * @returns Promise resolving to updated line item
   */
  updateLineItem: (
    company_id: number,
    product_id: number,
    line_item_id: number,
    data: UpdateLineItemData
  ) => {
    // Use PUT for complete updates, PATCH for partial updates
    if (data.line_item_product_id != null && data.quantity != null) {
      return apiRequest(`/companies/${company_id}/products/${product_id}/bom/${line_item_id}/`, {
        method: "PUT",
        body: data as unknown as Record<string, unknown>,
      });
    } else {
      return apiRequest(`/companies/${company_id}/products/${product_id}/bom/${line_item_id}/`, {
        method: "PATCH",
        body: data as unknown as Record<string, unknown>,
      });
    }
  },

  /**
   * Delete a line item from a product's BOM
   * @param company_id - ID of the company owning the product
   * @param product_id - ID of the product containing the line item
   * @param line_item_id - ID of the line item to delete
   * @returns Promise resolving when deletion is complete
   */
  deleteLineItem: (company_id: number, product_id: number, line_item_id: number) =>
    apiRequest(`/companies/${company_id}/products/${product_id}/bom/${line_item_id}/`, {
      method: "DELETE",
    }),
};
