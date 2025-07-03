/**
 * Company management API client
 * Handles company CRUD operations, user management, and company search functionality
 */

import { apiRequest } from "./apiClient";

// Interface representing a company entity
export interface Company {
  id: string;
  name: string;
  business_registration_number: string;
  vat_number: string;
}

// Interface for creating new companies
export interface CompanyCreateData {
  name: string;
  vat_number: string;
  business_registration_number: string;
}

// Interface representing an authenticated user within a company context
export interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

/**
 * Company management API endpoints
 * Provides methods for company operations and user management
 */
export const companyApi = {
  /**
   * Search for companies across the entire system
   * @param searchTerm - Search query string, if empty returns all companies
   * @returns Promise resolving to array of matching companies
   */
  searchAllCompanies: (searchTerm: string) =>
    apiRequest<Company[]>(searchTerm ? `/companies/${searchTerm}` : `/companies/`),

  /**
   * List all companies the current user has access to
   * Returns only companies where user is a member
   * @returns Promise resolving to array of user's companies
   */
  listCompanies: () => apiRequest<Company[]>("/companies/my/"),

  /**
   * Get detailed information for a specific company
   * @param companyId - Unique identifier for the company
   * @returns Promise resolving to company details
   */
  getCompany: (companyId: string) => apiRequest<Company>(`/companies/${companyId}/`),

  /**
   * Create a new company in the system
   * @param data - Company creation data including name and registration details
   * @returns Promise resolving to created company
   */
  createCompany: (data: CompanyCreateData) =>
    apiRequest<Company>("/companies/", {
      method: "POST",
      body: data as unknown as Record<string, unknown>,
    }),

  /**
   * Update an existing company's information
   * @param companyId - ID of company to update
   * @param data - Partial company data to update
   * @returns Promise resolving to updated company
   */
  updateCompany: (companyId: string, data: Partial<CompanyCreateData>) =>
    apiRequest<Company>(`/companies/${companyId}/`, {
      method: "PUT",
      body: data as unknown as Record<string, unknown>,
    }),

  /**
   * Delete a company from the system
   * This action permanently removes the company and all associated data
   * @param companyId - ID of company to delete
   * @returns Promise resolving when deletion is complete
   */
  deleteCompany: (companyId: string) =>
    apiRequest(`/companies/${companyId}/`, {
      method: "DELETE",
    }),

  // User management operations within a company context

  /**
   * List all users who have access to a specific company
   * @param companyId - ID of company to get users for
   * @returns Promise resolving to array of company users
   */
  listUsers: (companyId: string) =>
    apiRequest<AuthenticatedUser[]>(`/companies/${companyId}/users/`),

  /**
   * Add a user to a company by username
   * Grants the user access to the company's data and operations
   * @param companyId - ID of company to add user to
   * @param username - Username of user to add
   * @returns Promise resolving to success confirmation
   */
  addUser: (companyId: string, username: string) =>
    apiRequest<{ success: boolean }>(`/companies/${companyId}/users/`, {
      method: "POST",
      body: { username } as unknown as Record<string, unknown>,
    }),

  /**
   * Remove a user from a company
   * Revokes the user's access to the company's data
   * @param companyId - ID of company to remove user from
   * @param userId - ID of user to remove
   * @returns Promise resolving when removal is complete
   */
  removeUser: (companyId: string, userId: number) =>
    apiRequest(`/companies/${companyId}/users/${userId}/`, {
      method: "DELETE",
    }),
};
