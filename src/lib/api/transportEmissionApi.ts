import { apiRequest } from "./apiClient";
import { EmissionReference } from "./emissionReferenceApi";
import { OverrideFactor } from "./productionEmissionApi";

export interface TransportEmission {
  id: number;
  distance: number;
  weight: number;
  reference?: number | null;
  reference_details?: EmissionReference;
  override_factors?: OverrideFactor[];
  line_items?: number[];
}

export interface CreateTransportEmission {
  distance: number;
  weight: number;
  reference?: number | null;
  override_factors?: OverrideFactor[];
  line_items?: number[];
}

export interface UpdateTransportEmission {
  distance?: number;
  weight?: number;
  reference?: number | null;
  override_factors?: OverrideFactor[];
  line_items?: number[];
}

export interface TransportEmissionSchema {
  actions: {
    POST: {
      override_factors?: {
        child?: {
          children?: {
            lifecycle_stage?: {
              choices: LifecycleStageChoice[];
            };
          };
        };
      };
    };
  };
}

interface LifecycleStageChoice {
  value: string;
  display_name: string;
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

  getTransportEmissionOptions: (company_id: number, product_id: number) =>
    apiRequest<TransportEmissionSchema>(
      `/companies/${company_id}/products/${product_id}/emissions/transport/`,
      {
        method: "OPTIONS",
      }
    ),

  updateTransportEmission: (
    company_id: number,
    product_id: number,
    emission_id: number,
    data: UpdateTransportEmission
  ) => {
    if (data.distance !== undefined && data.weight !== undefined) {
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
