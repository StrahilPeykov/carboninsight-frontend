import { apiRequest } from "./apiClient";
import { OverrideFactor } from "./materialEmissionApi";

export interface TransportEmission {
  id: number;
  distance: number;
  weight: number;
  reference: number;
  override_factors: OverrideFactor[];
  line_items: number[];
}

export interface CreateTransportEmission {
  distance: number;
  weight: number;
  reference: number;
  override_factors: OverrideFactor[];
}

export interface UpdateTransportEmission {
  distance?: number;
  weight?: number;
  reference?: number;
  override_factors?: OverrideFactor[];
}

export const transportEmissionApi = {
  getAllTransportEmissions: (company_id: number, product_id: number) =>
    apiRequest<TransportEmission[]>(
      `/companies/${company_id}/products/${product_id}/emissions/transport/`,
      {
        method: "GET",
      }
    ),

  createTransportEmission: (
    company_id: number,
    product_id: number,
    data: CreateTransportEmission
  ) =>
    apiRequest<TransportEmission>(
      `/companies/${company_id}/products/${product_id}/emissions/transport/`,
      {
        method: "POST",
        body: data as unknown as Record<string, unknown>,
      }
    ),

  getTransportEmission: (company_id: number, product_id: number, emission_id: number) =>
    apiRequest<TransportEmission>(
      `/companies/${company_id}/products/${product_id}/emissions/transport/${emission_id}/`,
      {
        method: "GET",
      }
    ),

  updateTransportEmission: (
    company_id: number,
    product_id: number,
    emission_id: number,
    data: UpdateTransportEmission
  ) => {
    if (
      data.distance !== undefined &&
      data.weight !== undefined &&
      data.reference !== undefined &&
      data.override_factors !== undefined
    ) {
      return apiRequest(
        `/companies/${company_id}/products/${product_id}/emissions/transport/${emission_id}/`,
        {
          method: "PUT",
          body: data as unknown as Record<string, unknown>,
        }
      );
    } else {
      return apiRequest(
        `/companies/${company_id}/products/${product_id}/emissions/transport/${emission_id}/`,
        {
          method: "PATCH",
          body: data as unknown as Record<string, unknown>,
        }
      );
    }
  },

  deleteTransportEmission: (company_id: number, product_id: number, emission_id: number) =>
    apiRequest(
      `/companies/${company_id}/products/${product_id}/emissions/transport/${emission_id}/`,
      {
        method: "DELETE",
      }
    ),
};
