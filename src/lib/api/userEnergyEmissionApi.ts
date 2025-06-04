import { apiRequest } from "./apiClient";
import { EmissionReference } from "./emissionReferenceApi";
import { OverrideFactor } from "./productionEmissionApi";

export interface UserEnergyEmission {
  id: number;
  energy_consumption: number;
  reference?: number | null;
  reference_details?: EmissionReference;
  override_factors?: OverrideFactor[];
  line_items?: number[];
}

export interface CreateUserEnergyEmissionRequest {
  energy_consumption: number;
  reference?: number | null;
  override_factors?: OverrideFactor[];
  line_items?: number[];
}

export interface UpdateUserEnergyEmission {
  energy_consumption?: number;
  reference?: number | null;
  override_factors?: OverrideFactor[];
  line_items?: number[];
}

export const userEnergyEmissionApi = {
  getAllUserEnergyEmissions: (company_id: number, product_id: number) =>
    apiRequest<UserEnergyEmission[]>(
      `/companies/${company_id}/products/${product_id}/emissions/user_energy/`,
      {
        method: "GET",
      }
    ),

  createUserEnergyEmission: async (
    companyId: number,
    productId: number,
    data: CreateUserEnergyEmissionRequest
  ): Promise<UserEnergyEmission> => {
    return apiRequest<UserEnergyEmission, Partial<CreateUserEnergyEmissionRequest>>(
      `/companies/${companyId}/products/${productId}/emissions/user_energy/`,
      {
        method: "POST",
        body: data,
      }
    );
  },

  getUserEnergyEmission: (company_id: number, product_id: number, emission_id: number) =>
    apiRequest<UserEnergyEmission>(
      `/companies/${company_id}/products/${product_id}/emissions/user_energy/${emission_id}/`,
      {
        method: "GET",
      }
    ),

  updateUserEnergyEmission: async (
    companyId: number,
    productId: number,
    emissionId: number,
    data: Partial<CreateUserEnergyEmissionRequest>
  ): Promise<UserEnergyEmission> => {
    return apiRequest<UserEnergyEmission, Partial<CreateUserEnergyEmissionRequest>>(
      `/companies/${companyId}/products/${productId}/emissions/user_energy/${emissionId}/`,
      {
        method: "PATCH",
        body: data,
      }
    );
  },

  deleteUserEnergyEmission: (company_id: number, product_id: number, emission_id: number) =>
    apiRequest(
      `/companies/${company_id}/products/${product_id}/emissions/user_energy/${emission_id}/`,
      {
        method: "DELETE",
      }
    ),
};
