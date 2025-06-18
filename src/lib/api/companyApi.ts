import { apiRequest } from "./apiClient";

export interface Company {
  id: string;
  name: string;
  business_registration_number: string;
  vat_number: string;
}

export interface CompanyCreateData {
  name: string;
  vat_number: string;
  business_registration_number: string;
}

export interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export const companyApi = {
  // Search all companies with defensive programming
  searchAllCompanies: async (searchTerm: string): Promise<Company[]> => {
    try {
      const result = await apiRequest<Company[]>(
        searchTerm ? `/companies/${searchTerm}` : `/companies/`
      );
      
      // Defensive programming: ensure we always return an array
      if (!Array.isArray(result)) {
        console.warn("Search companies API returned non-array:", result);
        return [];
      }
      
      return result;
    } catch (error) {
      console.error("Error searching companies:", error);
      return []; // Return empty array on error
    }
  },

  // List all companies a user has access to with defensive programming
  listCompanies: async (): Promise<Company[]> => {
    try {
      const result = await apiRequest<Company[]>("/companies/my/");
      
      // Defensive programming: ensure we always return an array
      if (!Array.isArray(result)) {
        console.warn("Companies API returned non-array:", result);
        return []; // Return empty array if response is not an array
      }
      
      return result;
    } catch (error) {
      console.error("Error fetching companies:", error);
      return []; // Return empty array on error
    }
  },

  // Get a specific company by ID
  getCompany: (companyId: string) => apiRequest<Company>(`/companies/${companyId}/`),

  // Create a new company
  createCompany: (data: CompanyCreateData) =>
    apiRequest<Company>("/companies/", {
      method: "POST",
      body: data as unknown as Record<string, unknown>,
    }),

  // Update a company
  updateCompany: (companyId: string, data: Partial<CompanyCreateData>) =>
    apiRequest<Company>(`/companies/${companyId}/`, {
      method: "PUT",
      body: data as unknown as Record<string, unknown>,
    }),

  // Delete a company
  deleteCompany: (companyId: string) =>
    apiRequest(`/companies/${companyId}/`, {
      method: "DELETE",
    }),

  // User management within a company with defensive programming
  listUsers: async (companyId: string): Promise<AuthenticatedUser[]> => {
    try {
      const result = await apiRequest<AuthenticatedUser[]>(`/companies/${companyId}/users/`);
      
      // Defensive programming: ensure we always return an array
      if (!Array.isArray(result)) {
        console.warn("List users API returned non-array:", result);
        return [];
      }
      
      return result;
    } catch (error) {
      console.error("Error fetching company users:", error);
      return []; // Return empty array on error
    }
  },

  addUser: (companyId: string, username: string) =>
    apiRequest<{ success: boolean }>(`/companies/${companyId}/users/`, {
      method: "POST",
      body: { username } as unknown as Record<string, unknown>,
    }),

  removeUser: (companyId: string, userId: number) =>
    apiRequest(`/companies/${companyId}/users/${userId}/`, {
      method: "DELETE",
    }),
};
