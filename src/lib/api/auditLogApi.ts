/**
 * Audit log API client
 * Provides access to system audit trails for companies and products
 */

import { apiRequest } from "./apiClient";

// Type for content type labels in audit logs
export type ContentTypeLabel = "core";

// Types for different models that can be audited
export type ContentTypeModel =
  | "company"
  | "product"
  | "productionenergyemission"
  | "transportemission"
  | "userenergyemission";

/* 
 * Defines the type of action that was performed in audit logs:
 * 0: create - New record created
 * 1: update - Existing record modified
 * 2: delete - Record removed
 * 3: access - Record accessed/viewed
 */
export type AuditLogAction = 0 | 1 | 2 | 3;

// Human-readable labels for audit log actions
export const AuditLogActionDefinition: Record<AuditLogAction, string> = {
  0: "Create",
  1: "Update",
  2: "Delete",
  3: "Access",
};

// Interface representing a single audit log entry
export interface LogItem {
  id: number;
  timestamp: string;
  actor_username: string;
  content_type_app_label: ContentTypeLabel;
  content_type_model: ContentTypeModel;
  object_pk: string;
  action: AuditLogAction;
  changes: string;
}

/**
 * Audit log API endpoints
 * Provides methods for retrieving audit trails for companies and products
 */
export const auditLogApi = {
  /**
   * Get audit logs for all activities within a company
   * Returns chronological log of all actions performed on company data
   * @param companyId - ID of the company to get audit logs for
   * @returns Promise resolving to array of audit log entries
   */
  getCompanyAuditLogs: (companyId: number) =>
    apiRequest<LogItem[]>(`/companies/${companyId}/audit/`),

  /**
   * Get audit logs for a specific product
   * Returns chronological log of all actions performed on the product
   * @param companyId - ID of the company owning the product
   * @param productId - ID of the product to get audit logs for
   * @returns Promise resolving to array of product-specific audit log entries
   */
  getProductAuditLogs: (companyId: number, productId: number) =>
    apiRequest<LogItem[]>(`/companies/${companyId}/products/${productId}/audit/`),
};
