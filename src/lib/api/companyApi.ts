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
  // Search all companies
  searchAllCompanies: (searchTerm: string) =>
    apiRequest<Company[]>(searchTerm ? `/companies/${searchTerm}` : `/companies/`),

  // List all companies a user has access to
  listCompanies: () => apiRequest<Company[]>("/companies/my/"),

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

  // User management within a company
  listUsers: (companyId: string) =>
    apiRequest<AuthenticatedUser[]>(`/companies/${companyId}/users/`),

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
