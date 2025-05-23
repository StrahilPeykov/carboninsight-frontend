import { apiRequest } from "./apiClient";
import { Product } from "./productApi";

type EmissionType =
  | "TransportEmission"
  | "MaterialEmission"
  | "UserEnergyEmission"
  | "ProductionEnergyEmission";
type Status = "Pending" | "Accepted" | "Rejected";

interface Emission {
  id: number;
  quantity: number;
  type: EmissionType;
  url: string | null;
}

export interface LineItem {
  id: number;
  quantity: number;
  line_item_product: Product;
  parent_product: number;
  product_sharing_request_status: Status;
  emissions: Emission[];
}

export interface CreateLineItemData {
  quantity: number;
  line_item_product_id: number;
}

export interface UpdateLineItemData {
  quantity?: number;
  line_item_product_id?: number;
}

export const bomApi = {
  getAllLineItems: (company_id: number, product_id: number) =>
    apiRequest<LineItem[]>(`/companies/${company_id}/products/${product_id}/bom/`, {
      method: "GET",
    }),

  createNewLineItem: (company_id: number, product_id: number, data: CreateLineItemData) =>
    apiRequest<LineItem>(`/companies/${company_id}/products/${product_id}/bom/`, {
      method: "POST",
      body: data as unknown as Record<string, unknown>,
    }),

  getLineItem: (company_id: number, product_id: number, line_item_id: number) =>
    apiRequest<LineItem>(`/companies/${company_id}/products/${product_id}/bom/${line_item_id}/`, {
      method: "GET",
    }),

  updateLineItem: (
    company_id: number,
    product_id: number,
    line_item_id: number,
    data: UpdateLineItemData
  ) => {
    if (data.line_item_product_id !== undefined && data.quantity !== undefined) {
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

  deleteLineItem: (company_id: number, product_id: number, line_item_id: number) =>
    apiRequest(`/companies/${company_id}/products/${product_id}/bom/${line_item_id}/`, {
      method: "DELETE",
    }),
};
