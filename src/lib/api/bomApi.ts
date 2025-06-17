import { apiRequest } from "./apiClient";

type EmissionType =
  | "TransportEmission"
  | "MaterialEmission"
  | "UserEnergyEmission"
  | "ProductionEnergyEmission";
type Status = "Pending" | "Accepted" | "Rejected" | "Not requested";

interface Emission {
  id: number;
  quantity: number;
  type: EmissionType;
  url: string | null;
}

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

export interface LineItem {
  id: number;
  quantity: number;
  line_item_product: Product;
  parent_product: number;
  calculate_emissions?: Emission[];
  product_sharing_request_status: Status;
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

  deleteLineItem: (company_id: number, product_id: number, line_item_id: number) =>
    apiRequest(`/companies/${company_id}/products/${product_id}/bom/${line_item_id}/`, {
      method: "DELETE",
    }),
};
