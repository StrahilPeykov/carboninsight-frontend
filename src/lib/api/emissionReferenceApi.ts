import { apiRequest } from "./apiClient";
import { OverrideFactor } from "./productionEmissionApi";

export interface EmissionReference {
  id: number;
  name: string;
  emission_factors: OverrideFactor[];
}

export const emissionReferenceApi = {
  // Production Energy Emission References
  getAllProductionEnergyReferences: () =>
    apiRequest<EmissionReference[]>(`/reference/production_energy/`),

  getProductionEnergyReference: (referenceId: number) =>
    apiRequest<EmissionReference>(`/reference/production_energy/${referenceId}/`),

  // Transport Emission References
  getAllTransportReferences: () => apiRequest<EmissionReference[]>(`/reference/transport/`),

  getTransportReference: (referenceId: number) =>
    apiRequest<EmissionReference>(`/reference/transport/${referenceId}/`),

  // User Energy Emission References
  getAllUserEnergyReferences: () => apiRequest<EmissionReference[]>(`/reference/user_energy/`),

  getUserEnergyReference: (referenceId: number) =>
    apiRequest<EmissionReference>(`/reference/user_energy/${referenceId}/`),
};
