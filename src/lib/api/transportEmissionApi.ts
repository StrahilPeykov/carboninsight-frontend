/**
 * Transport Emission API client
 * Manages transportation-related carbon emissions for products and materials
 */

import { apiRequest } from "./apiClient";
import { EmissionReference } from "./emissionReferenceApi";
import { LifecycleStageChoice } from "./overrideEmissionApi";
import { OverrideFactor } from "./productionEmissionApi";

// Interface representing transport emission data
export interface TransportEmission {
  id: number;
  distance: number;                        // Transport distance (km)
  weight: number;                          // Weight of transported goods (kg)
  reference?: number | null;               // Reference to standard emission factors
  reference_details?: EmissionReference;   // Detailed reference information
  override_factors?: OverrideFactor[];     // Custom emission factors
  line_items?: number[];                   // Associated BOM line items
}

// Interface for creating new transport emission records
export interface CreateTransportEmission {
  distance: number;
  weight: number;
  reference?: number | null;
  override_factors?: OverrideFactor[];
  line_items?: number[];
}

// Interface for updating existing transport emission records
export interface UpdateTransportEmission {
  distance?: number;
  weight?: number;
  reference?: number | null;
  override_factors?: OverrideFactor[];
  line_items?: number[];
}

// Interface representing the API schema for transport emissions
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

/**
 * Transport Emission API endpoints
 * Provides methods for managing transportation carbon footprint data
 */
export const transportEmissionApi = {
  /**
   * Get all transport emissions for a specific product
   * Returns comprehensive list of transportation-related emissions
   * @param company_id - ID of the company owning the product
   * @param product_id - ID of the product to get transport emissions for
   * @returns Promise resolving to array of transport emissions
   */
  getAllTransportEmissions: (company_id: number, product_id: number) =>
    apiRequest<TransportEmission[]>(
      `/companies/${company_id}/products/${product_id}/emissions/transport/`,
      {
        method: "GET",
      }
    ),

  /**
   * Create a new transport emission record
   * @param company_id - ID of the company owning the product
   * @param product_id - ID of the product to add transport emission to
   * @param data - Transport emission data including distance and weight
   * @returns Promise resolving to created transport emission
   */
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

  /**
   * Get details of a specific transport emission record
   * @param company_id - ID of the company owning the product
   * @param product_id - ID of the product containing the emission
   * @param emission_id - ID of the specific transport emission
   * @returns Promise resolving to transport emission details
   */
  getTransportEmission: (company_id: number, product_id: number, emission_id: number) =>
    apiRequest<TransportEmission>(
      `/companies/${company_id}/products/${product_id}/emissions/transport/${emission_id}/`,
      {
        method: "GET",
      }
    ),

  /**
   * Get available options and schema for transport emissions
   * Useful for understanding available lifecycle stage choices
   * @param company_id - ID of the company owning the product
   * @param product_id - ID of the product to get options for
   * @returns Promise resolving to transport emission schema
   */
  getTransportEmissionOptions: (company_id: number, product_id: number) =>
    apiRequest<TransportEmissionSchema>(
      `/companies/${company_id}/products/${product_id}/emissions/transport/`,
      {
        method: "OPTIONS",
      }
    ),

  /**
   * Update an existing transport emission record
   * Uses PUT for complete updates or PATCH for partial updates
   * @param company_id - ID of the company owning the product
   * @param product_id - ID of the product containing the emission
   * @param emission_id - ID of the transport emission to update
   * @param data - Updated transport emission data
   * @returns Promise resolving to updated transport emission
   */
  updateTransportEmission: (
    company_id: number,
    product_id: number,
    emission_id: number,
    data: UpdateTransportEmission
  ) => {
    // Use PUT for complete updates (both distance and weight provided)
    if (data.distance !== undefined && data.weight !== undefined) {
      return apiRequest(
        `/companies/${company_id}/products/${product_id}/emissions/transport/${emission_id}/`,
        {
          method: "PUT",
          body: data as unknown as Record<string, unknown>,
        }
      );
    } else {
      // Use PATCH for partial updates
      return apiRequest(
        `/companies/${company_id}/products/${product_id}/emissions/transport/${emission_id}/`,
        {
          method: "PATCH",
          body: data as unknown as Record<string, unknown>,
        }
      );
    }
  },

  /**
   * Delete a transport emission record
   * Permanently removes the transportation emission data
   * @param company_id - ID of the company owning the product
   * @param product_id - ID of the product containing the emission
   * @param emission_id - ID of the transport emission to delete
   * @returns Promise resolving when deletion is complete
   */
  deleteTransportEmission: (company_id: number, product_id: number, emission_id: number) =>
    apiRequest(
      `/companies/${company_id}/products/${product_id}/emissions/transport/${emission_id}/`,
      {
        method: "DELETE",
      }
    ),
};
