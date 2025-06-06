import { apiRequest } from "./apiClient";

export type ContentTypeLabel = "core";

export type ContentTypeModel = "company" | "product" | "productionenergyemission" | "transportemission" | "userenergyemission";

/* 
    Defines the type of action that was performed:
    0: create.
    1: update.
    2: delete.
    3: access.
*/
export type AuditLogAction = 0 | 1 | 2 | 3; 
export const AuditLogActionDefinition: Record<AuditLogAction, string> = {
  0: "Create",
  1: "Update",
  2: "Delete",
  3: "Access",
};

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

/*
    Api wrapper to get the audit logs of a company and or product.
*/
export const auditLogApi = {
  getCompanyAuditLogs: (companyId: number) =>
    apiRequest<LogItem[]>(`/companies/${companyId}/audit/`),

  getProductAuditLogs: (companyId: number, productId: number) =>
    apiRequest<LogItem[]>(`/companies/${companyId}/products/${productId}/audit/`)
};
