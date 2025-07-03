/**
 * Production Energy Emission API client
 * Manages energy consumption data and emission calculations for manufacturing processes
 */

import { apiRequest } from "./apiClient";
import { EmissionReference } from "./emissionReferenceApi";

// Lifecycle stage definitions following industry standards (ISO 14040/14044)
export type LifecycleStage =
  | "A1"    // Raw material supply
  | "A2"    // Transport to manufacturer
  | "A3"    // Manufacturing
  | "A4"    // Transport to construction site
  | "A5"    // Installation process
  | "A1-A3" // Combined product stage
  | "A4-A5" // Combined construction stage
  | "B1"    // Use
  | "B2"    // Maintenance
  | "B3"    // Repair
  | "B4"    // Replacement
  | "B5"    // Refurbishment
  | "B6"    // Operational energy use
  | "B7"    // Operational water use
  | "B1-B7" // Combined use stage
  | "C1"    // Deconstruction/demolition
  | "C2"    // Transport to waste processing
  | "C3"    // Waste processing
  | "C4"    // Disposal
  | "C1-C4" // Combined end-of-life stage
  | "C2-C4" // End-of-life excluding deconstruction
  | "D"     // Benefits beyond system boundary
  | "Other"; // Custom lifecycle stages

// Array of all available lifecycle stages for validation and UI components
export const lifecycleStages = [
  "A1", "A2", "A3", "A4", "A5", "A1-A3", "A4-A5",
  "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B1-B7",
  "C1", "C2", "C3", "C4", "C1-C4", "C2-C4", "D", "Other",
];

// Interface for custom emission factors that override default reference values
export interface OverrideFactor {
  id?: number;
  lifecycle_stage?: LifecycleStage;
  co_2_emission_factor_biogenic?: number;     // Biogenic CO2 emissions (kg CO2-eq)
  co_2_emission_factor_non_biogenic?: number; // Non-biogenic CO2 emissions (kg CO2-eq)
}

// Interface representing production energy emission data
export interface ProductionEnergyEmission {
  id: number;
  energy_consumption: number;              // Energy consumed in production (kWh, MJ, etc.)
  reference?: number | null;               // Reference to standard emission factors
  reference_details?: EmissionReference;   // Detailed reference information
  override_factors?: OverrideFactor[];     // Custom emission factors
  line_items?: number[];                   // Associated BOM line items
}

// Interface for creating new production energy emission records
export interface CreateProductionEnergyEmissionRequest {
  energy_consumption: number;
  reference?: number | null;
  override_factors?: OverrideFactor[];
  line_items?: number[];
}

/**
 * Production Energy Emission API endpoints
 * Provides methods for managing energy consumption and emission calculations
 */
export const productionEnergyApi = {
  /**
   * Get all production energy emissions for a specific product
   * Returns comprehensive list of energy consumption records and calculations
   * @param companyId - ID of the company owning the product
   * @param productId - ID of the product to get emissions for
   * @returns Promise resolving to array of production energy emissions
   */
  getAllProductionEmissions: async (
    companyId: number,
    productId: number
  ): Promise<ProductionEnergyEmission[]> => {
    return apiRequest<ProductionEnergyEmission[]>(
      `/companies/${companyId}/products/${productId}/emissions/production_energy/`
    );
  },

  /**
   * Get details of a specific production energy emission record
   * @param companyId - ID of the company owning the product
   * @param productId - ID of the product containing the emission
   * @param emissionId - ID of the specific emission record
   * @returns Promise resolving to production energy emission details
   */
  getProductionEmission: async (
    companyId: number,
    productId: number,
    emissionId: number
  ): Promise<ProductionEnergyEmission> => {
    return apiRequest<ProductionEnergyEmission>(
      `/companies/${companyId}/products/${productId}/production_energy/${emissionId}/`
    );
  },

  /**
   * Create a new production energy emission record
   * @param companyId - ID of the company owning the product
   * @param productId - ID of the product to add emission data to
   * @param data - Production energy emission data
   * @returns Promise resolving to created emission record
   */
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

  /**
   * Update an existing production energy emission record
   * Uses PATCH for partial updates of emission data
   * @param companyId - ID of the company owning the product
   * @param productId - ID of the product containing the emission
   * @param emissionId - ID of the emission record to update
   * @param data - Partial production energy emission data to update
   * @returns Promise resolving to updated emission record
   */
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

  /**
   * Delete a production energy emission record
   * Permanently removes the emission data from the product
   * @param companyId - ID of the company owning the product
   * @param productId - ID of the product containing the emission
   * @param emissionId - ID of the emission record to delete
   * @returns Promise resolving when deletion is complete
   */
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
