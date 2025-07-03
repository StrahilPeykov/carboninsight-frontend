/**
 * User Energy Emission API client
 * Manages energy consumption data during product use phase
 */

import { apiRequest } from "./apiClient";
import { EmissionReference } from "./emissionReferenceApi";
import { OverrideFactor } from "./productionEmissionApi";

// Interface representing user energy emission data during product use
export interface UserEnergyEmission {
  id: number;
  energy_consumption: number;              // Energy consumed during use phase (kWh, MJ, etc.)
  reference?: number | null;               // Reference to standard emission factors
  reference_details?: EmissionReference;   // Detailed reference information
  override_factors?: OverrideFactor[];     // Custom emission factors
  line_items?: number[];                   // Associated BOM line items
}

// Interface for creating new user energy emission records
export interface CreateUserEnergyEmissionRequest {
  energy_consumption: number;
  reference?: number | null;
  override_factors?: OverrideFactor[];
  line_items?: number[];
}

// Interface for updating existing user energy emission records
export interface UpdateUserEnergyEmission {
  energy_consumption?: number;
  reference?: number | null;
  override_factors?: OverrideFactor[];
  line_items?: number[];
}

/**
 * User Energy Emission API endpoints
 * Provides methods for managing energy consumption during product use phase
 */
export const userEnergyEmissionApi = {
  /**
   * Get all user energy emissions for a specific product
   * Returns comprehensive list of use-phase energy consumption records
   * @param company_id - ID of the company owning the product
   * @param product_id - ID of the product to get user energy emissions for
   * @returns Promise resolving to array of user energy emissions
   */
  getAllUserEnergyEmissions: (company_id: number, product_id: number) =>
    apiRequest<UserEnergyEmission[]>(
      `/companies/${company_id}/products/${product_id}/emissions/user_energy/`,
      {
        method: "GET",
      }
    ),

  /**
   * Create a new user energy emission record
   * @param companyId - ID of the company owning the product
   * @param productId - ID of the product to add user energy emission to
   * @param data - User energy emission data including consumption values
   * @returns Promise resolving to created user energy emission
   */
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

  /**
   * Get details of a specific user energy emission record
   * @param company_id - ID of the company owning the product
   * @param product_id - ID of the product containing the emission
   * @param emission_id - ID of the specific user energy emission
   * @returns Promise resolving to user energy emission details
   */
  getUserEnergyEmission: (company_id: number, product_id: number, emission_id: number) =>
    apiRequest<UserEnergyEmission>(
      `/companies/${company_id}/products/${product_id}/emissions/user_energy/${emission_id}/`,
      {
        method: "GET",
      }
    ),

  /**
   * Update an existing user energy emission record
   * Uses PATCH for partial updates of emission data
   * @param companyId - ID of the company owning the product
   * @param productId - ID of the product containing the emission
   * @param emissionId - ID of the user energy emission to update
   * @param data - Partial user energy emission data to update
   * @returns Promise resolving to updated user energy emission
   */
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

  /**
   * Delete a user energy emission record
   * Permanently removes the use-phase energy consumption data
   * @param company_id - ID of the company owning the product
   * @param product_id - ID of the product containing the emission
   * @param emission_id - ID of the user energy emission to delete
   * @returns Promise resolving when deletion is complete
   */
  deleteUserEnergyEmission: (company_id: number, product_id: number, emission_id: number) =>
    apiRequest(
      `/companies/${company_id}/products/${product_id}/emissions/user_energy/${emission_id}/`,
      {
        method: "DELETE",
      }
    ),
};
