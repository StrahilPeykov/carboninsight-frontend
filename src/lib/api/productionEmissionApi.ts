import { apiRequest } from "./apiClient";

export interface ProductionEnergyEmission {
  id: number;
  energy_consumption: number;
  reference?: number | null;
  override_factors?: EmissionOverrideFactor[];
  line_items?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface EmissionOverrideFactor {
  id?: number;
  lifecycle_stage: string;
  co_2_emission_factor: number;
}

export interface CreateProductionEnergyEmissionRequest {
  energy_consumption: number;
  reference?: number | null;
  override_factors?: EmissionOverrideFactor[];
  line_items?: number[];
}

export const productionEnergyApi = {
  getAllProductionEmissions: async (
    companyId: number,
    productId: number
  ): Promise<ProductionEnergyEmission[]> => {
    return apiRequest<ProductionEnergyEmission[]>(
      `/companies/${companyId}/products/${productId}/emissions/production_energy/`
    );
  },

  getProductionEmission: async (
    companyId: number,
    productId: number,
    emissionId: number
  ): Promise<ProductionEnergyEmission> => {
    return apiRequest<ProductionEnergyEmission>(
      `/companies/${companyId}/products/${productId}/production_energy/${emissionId}/`
    );
  },
  createProductionEmission: async (
    companyId: number,
    productId: number,
    data: CreateProductionEnergyEmissionRequest
  ): Promise<ProductionEnergyEmission> => {
    return apiRequest<ProductionEnergyEmission, Partial<CreateProductionEnergyEmissionRequest>>(
      `/companies/${companyId}/products/${productId}/emissions/production_energy/`,
      {
        method: "POST",
        body: data,
      }
    );
  },

  updateProductionEmission: async (
    companyId: number,
    productId: number,
    emissionId: number,
    data: Partial<CreateProductionEnergyEmissionRequest>
  ): Promise<ProductionEnergyEmission> => {
    return apiRequest<ProductionEnergyEmission, Partial<CreateProductionEnergyEmissionRequest>>(
      `/companies/${companyId}/products/${productId}/emissions/production_energy/${emissionId}/`,
      {
        method: "PATCH",
        body: data,
      }
    );
  },

  deleteProductionEmission: async (
    companyId: number,
    productId: number,
    emissionId: number
  ): Promise<void> => {
    return apiRequest<void>(
      `/companies/${companyId}/products/${productId}/emissions/production_energy/${emissionId}/`,
      { method: "DELETE" }
    );
  },
};
