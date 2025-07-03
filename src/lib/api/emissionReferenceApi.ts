/**
 * Emission reference data API client
 * Provides access to standardized emission factors for different calculation types
 */

import { apiRequest } from "./apiClient";
import { OverrideFactor } from "./productionEmissionApi";

// Interface representing emission reference data with associated factors
export interface EmissionReference {
  id: number;
  name: string;
  emission_factors: OverrideFactor[];
}

/**
 * Emission reference API endpoints
 * Provides access to standardized emission factor databases
 */
export const emissionReferenceApi = {
  // Production Energy Emission Reference Operations

  /**
   * Get all available production energy emission references
   * Returns standardized emission factors for production energy calculations
   * @returns Promise resolving to array of production energy references
   */
  getAllProductionEnergyReferences: () =>
    apiRequest<EmissionReference[]>(`/reference/production_energy/`),

  /**
   * Get a specific production energy emission reference
   * @param referenceId - ID of the reference to retrieve
   * @returns Promise resolving to production energy reference details
   */
  getProductionEnergyReference: (referenceId: number) =>
    apiRequest<EmissionReference>(`/reference/production_energy/${referenceId}/`),

  // Transport Emission Reference Operations

  /**
   * Get all available transport emission references
   * Returns standardized emission factors for transportation calculations
   * @returns Promise resolving to array of transport references
   */
  getAllTransportReferences: () => apiRequest<EmissionReference[]>(`/reference/transport/`),

  /**
   * Get a specific transport emission reference
   * @param referenceId - ID of the reference to retrieve
   * @returns Promise resolving to transport reference details
   */
  getTransportReference: (referenceId: number) =>
    apiRequest<EmissionReference>(`/reference/transport/${referenceId}/`),

  // User Energy Emission Reference Operations

  /**
   * Get all available user energy emission references
   * Returns standardized emission factors for user energy consumption calculations
   * @returns Promise resolving to array of user energy references
   */
  getAllUserEnergyReferences: () => apiRequest<EmissionReference[]>(`/reference/user_energy/`),

  /**
   * Get a specific user energy emission reference
   * @param referenceId - ID of the reference to retrieve
   * @returns Promise resolving to user energy reference details
   */
  getUserEnergyReference: (referenceId: number) =>
    apiRequest<EmissionReference>(`/reference/user_energy/${referenceId}/`),
};
