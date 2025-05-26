import { apiRequest } from "./apiClient";
import { OverrideFactor } from "./materialEmissionApi";

export interface UserEnergyEmission {
  id: number;
  energy_consumption: number;
  reference: number;
  override_factors: OverrideFactor[];
  line_items: number[];
}

export interface CreateUserEnergyEmission {
  energy_consumption: number;
  reference: number;
  override_factors: OverrideFactor[];
}

export interface UpdateUserEnergyEmission {
  energy_consumption?: number;
  reference?: number;
  override_factors?: OverrideFactor[];
}

export const userEnergyEmissionApi = {
  getAllUserEnergyEmissions: (company_id: number, product_id: number) =>
    apiRequest<UserEnergyEmission[]>(
      `/companies/${company_id}/products/${product_id}/emissions/user_energy/`,
      {
        method: "GET",
      }
    ),

  createUserEnergyEmission: (
    company_id: number,
    product_id: number,
    data: CreateUserEnergyEmission
  ) =>
    apiRequest<UserEnergyEmission>(
      `/companies/${company_id}/products/${product_id}/emissions/user_energy/`,
      {
        method: "POST",
        body: data as unknown as Record<string, unknown>,
      }
    ),

  getUserEnergyEmission: (company_id: number, product_id: number, emission_id: number) =>
    apiRequest<UserEnergyEmission>(
      `/companies/${company_id}/products/${product_id}/emissions/user_energy/${emission_id}/`,
      {
        method: "GET",
      }
    ),

  updateUserEnergyEmission: (
    company_id: number,
    product_id: number,
    emission_id: number,
    data: UpdateUserEnergyEmission
  ) => {
    if (
      data.energy_consumption !== undefined &&
      data.reference !== undefined &&
      data.override_factors !== undefined
    ) {
      return apiRequest(
        `/companies/${company_id}/products/${product_id}/emissions/user_energy/${emission_id}/`,
        {
          method: "PUT",
          body: data as unknown as Record<string, unknown>,
        }
      );
    } else {
      return apiRequest(
        `/companies/${company_id}/products/${product_id}/emissions/user_energy/${emission_id}/`,
        {
          method: "PATCH",
          body: data as unknown as Record<string, unknown>,
        }
      );
    }
  },

  deleteUserEnergyEmission: (company_id: number, product_id: number, emission_id: number) =>
    apiRequest(
      `/companies/${company_id}/products/${product_id}/emissions/user_energy/${emission_id}/`,
      {
        method: "DELETE",
      }
    ),
};
