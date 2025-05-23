import { apiRequest } from "./apiClient";
import { LineItem } from "./bomApi";
import { OverrideFactor } from "./materialEmissionApi";

export interface ProductionEnergyEmission {
  id: number;
  energy_consumption: number;
  reference: number;
  override_factors: OverrideFactor[];
  line_items: LineItem[];
}

export interface CreateProductionEnergyEmission {
  energy_consumption: number;
  reference: number;
  override_factors: OverrideFactor[];
}

export interface UpdateProductionEnergyEmission {
  energy_consumption?: number;
  reference?: number;
  override_factors?: OverrideFactor[];
}

export const productionEnergyEmissionApi = {
  getAllProductionEnergyEmissions: (company_id: number, product_id: number) =>
    apiRequest<ProductionEnergyEmission[]>(
      `/companies/${company_id}/products/${product_id}/emissions/production_energy/`,
      {
        method: "GET",
      }
    ),

  createProductionEnergyEmission: (
    company_id: number,
    product_id: number,
    data: CreateProductionEnergyEmission
  ) =>
    apiRequest<ProductionEnergyEmission>(
      `/companies/${company_id}/products/${product_id}/emissions/production_energy/`,
      {
        method: "POST",
        body: data as unknown as Record<string, unknown>,
      }
    ),

  getProductionEnergyEmission: (company_id: number, product_id: number, emission_id: number) =>
    apiRequest<ProductionEnergyEmission>(
      `/companies/${company_id}/products/${product_id}/emissions/production_energy/${emission_id}/`,
      {
        method: "GET",
      }
    ),

  updateProductionEnergyEmission: (
    company_id: number,
    product_id: number,
    emission_id: number,
    data: UpdateProductionEnergyEmission
  ) => {
    if (
      data.energy_consumption !== undefined &&
      data.reference !== undefined &&
      data.override_factors !== undefined
    ) {
      return apiRequest(
        `/companies/${company_id}/products/${product_id}/emissions/production_energy/${emission_id}/`,
        {
          method: "PUT",
          body: data as unknown as Record<string, unknown>,
        }
      );
    } else {
      return apiRequest(
        `/companies/${company_id}/products/${product_id}/emissions/production_energy/${emission_id}/`,
        {
          method: "PATCH",
          body: data as unknown as Record<string, unknown>,
        }
      );
    }
  },

  deleteProductionEnergyEmission: (company_id: number, product_id: number, emission_id: number) =>
    apiRequest(
      `/companies/${company_id}/products/${product_id}/emissions/production_energy/${emission_id}/`,
      {
        method: "DELETE",
      }
    ),
};
