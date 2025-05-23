import { apiRequest } from "@/lib/api/apiClient";

// Export formats
export type ExportFormat =
  | "pdf" // Digital Product Passport report (frontend generated)
  | "aasx" // AAS package (primary DPP format)
  | "aas_xml" // AAS XML format
  | "aas_json" // AAS JSON format
  | "scsn_pcf_xml" // SCSN PCF XML (partial)
  | "scsn_full_xml" // SCSN full XML (complete)
  | "csv" // CSV export for spreadsheet import
  | "xlsx"; // Excel export

interface Product {
  id: string;
  name: string;
  description: string;
  manufacturer_name: string;
  sku: string;
  supplier: string;
  emission_total: string;
}

// Downloads a file from a blob response
function downloadFile(blob: Blob, filename: string, mimeType: string) {
  const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Export product data using backend's export endpoints
export async function exportProduct(
  companyId: string,
  productId: string,
  format: Exclude<ExportFormat, "pdf">,
  productName: string = "product"
): Promise<void> {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No authentication token available");
  }

  // Map frontend format names to actual backend endpoint paths
  const formatEndpoints = {
    aasx: "export/aas_aasx",
    aas_xml: "export/aas_xml",
    aas_json: "export/aas_json",
    scsn_pcf_xml: "export/scsn_pcf_xml",
    scsn_full_xml: "export/scsn_full_xml",
    csv: "export/csv",
    xlsx: "export/xlsx",
  };

  const mimeTypes = {
    aasx: "application/asset-administration-shell-package",
    aas_xml: "application/xml",
    aas_json: "application/json",
    scsn_pcf_xml: "application/xml",
    scsn_full_xml: "application/xml",
    csv: "text/csv",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };

  const fileExtensions = {
    aasx: "aasx",
    aas_xml: "xml",
    aas_json: "json",
    scsn_pcf_xml: "xml",
    scsn_full_xml: "xml",
    csv: "csv",
    xlsx: "xlsx",
  };

  try {
    const endpoint = `/companies/${companyId}/products/${productId}/${formatEndpoints[format]}/`;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Export failed: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const cleanProductName = productName.replace(/[^a-zA-Z0-9]/g, "_");
    const formatSuffix = format.replace("_", "_");
    const filename = `${cleanProductName}_${formatSuffix}_${new Date().toISOString().split("T")[0]}.${fileExtensions[format]}`;

    downloadFile(blob, filename, mimeTypes[format]);
  } catch (error) {
    console.error(`Export failed for format ${format}:`, error);
    throw new Error(
      `Failed to export ${format}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generate and download a comprehensive PDF report using emission traces
 * This calls backend API to get emission traces and generates a clean PDF
 */
export async function exportProductPDFReport(companyId: string, product: Product): Promise<void> {
  try {
    // Fetch emission traces from backend
    const emissionTrace = await apiRequest<any>(
      `/companies/${companyId}/products/${product.id}/emission_traces/`
    );

    // Create a simple HTML report that can be printed to PDF
    const reportHtml = generatePDFReportHTML(product, emissionTrace);

    // Open in new window for user to print/save as PDF
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      throw new Error("Popup blocked. Please allow popups and try again.");
    }

    printWindow.document.write(reportHtml);
    printWindow.document.close();

    // Auto-trigger print dialog after content loads
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  } catch (error) {
    console.error("PDF report generation failed:", error);
    throw new Error(
      "Failed to generate PDF report: " + (error instanceof Error ? error.message : "Unknown error")
    );
  }
}

// Generate HTML for PDF report
function generatePDFReportHTML(product: Product, emissionTrace: any): string {
  const formatEmissionsSubtotal = (subtotal: Record<string, number>): string => {
    return Object.entries(subtotal)
      .map(([stage, value]) => `<li>${stage}: ${value.toFixed(2)} kg CO₂e</li>`)
      .join("");
  };

  const renderEmissionTrace = (trace: any, depth: number = 0): string => {
    const indent = "  ".repeat(depth);
    const marginLeft = depth * 20;

    let html = `
      <div style="margin-left: ${marginLeft}px; margin-bottom: 15px; border-left: ${depth > 0 ? "2px solid #e5e5e5" : "none"}; padding-left: ${depth > 0 ? "15px" : "0"};">
        <h${Math.min(depth + 3, 6)} style="color: #c20016; margin-bottom: 8px;">${trace.label}</h${Math.min(depth + 3, 6)}>
        
        ${trace.methodology ? `<p><strong>Method:</strong> ${trace.methodology}</p>` : ""}
        ${trace.source ? `<p><strong>Source:</strong> ${trace.source}</p>` : ""}
        
        <p style="color: #2d5a27; font-weight: bold; font-size: 1.1em;">
          Total: ${trace.total} kg CO₂e
        </p>
        
        ${
          Object.keys(trace.emissions_subtotal || {}).length > 0
            ? `<div>
            <strong>Breakdown by Lifecycle Stage:</strong>
            <ul style="margin: 5px 0;">${formatEmissionsSubtotal(trace.emissions_subtotal)}</ul>
          </div>`
            : ""
        }
        
        ${
          trace.mentions && trace.mentions.length > 0
            ? trace.mentions
                .map((mention: any) => {
                  const color =
                    mention.mention_class === "Error"
                      ? "#dc2626"
                      : mention.mention_class === "Warning"
                        ? "#ea580c"
                        : "#059669";
                  return `<div style="color: ${color}; font-weight: bold; margin: 5px 0;">
              ${mention.mention_class}: ${mention.message}
            </div>`;
                })
                .join("")
            : ""
        }
      </div>
    `;

    // Render children
    if (trace.children && trace.children.length > 0) {
      trace.children.forEach((child: any) => {
        html += `<div style="margin-left: ${marginLeft + 20}px; font-size: 0.9em; color: #666;">
          Quantity: ${child.quantity}x
        </div>`;
        html += renderEmissionTrace(child.emission_trace, depth + 1);
      });
    }

    return html;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Digital Product Passport - ${product.name}</title>
      <style>
        @media print {
          body { margin: 0; }
          @page { margin: 2cm; }
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #c20016;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #c20016;
          margin: 0;
          font-size: 2.5em;
        }
        .header h2 {
          color: #666;
          margin: 10px 0 0 0;
          font-size: 1.5em;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: #c20016;
          border-bottom: 2px solid #e5e5e5;
          padding-bottom: 5px;
        }
        .product-info {
          background: #f8f8f8;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .product-info table {
          width: 100%;
          border-collapse: collapse;
        }
        .product-info td {
          padding: 8px;
          border-bottom: 1px solid #ddd;
        }
        .product-info td:first-child {
          font-weight: bold;
          width: 200px;
        }
        .total-emissions {
          background: #e8f5e8;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          font-size: 1.3em;
          font-weight: bold;
          color: #2d5a27;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #e5e5e5;
          color: #666;
          font-size: 0.9em;
        }
        .standards-note {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
        }
        ul {
          list-style-type: disc;
          margin-left: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Digital Product Passport</h1>
        <h2>Carbon Footprint Report</h2>
      </div>

      <div class="section">
        <h2>Product Information</h2>
        <div class="product-info">
          <table>
            <tr><td>Product Name:</td><td>${product.name}</td></tr>
            <tr><td>SKU:</td><td>${product.sku}</td></tr>
            <tr><td>Description:</td><td>${product.description}</td></tr>
            <tr><td>Manufacturer:</td><td>${product.manufacturer_name}</td></tr>
            <tr><td>Total Emissions:</td><td>${product.emission_total} kg CO₂e</td></tr>
            <tr><td>PCF Calculation Method:</td><td>${emissionTrace.pcf_calculation_method || "ISO 14040/14044"}</td></tr>
            <tr><td>Reference Impact Unit:</td><td>${emissionTrace.reference_impact_unit || "piece"}</td></tr>
          </table>
        </div>
        
        <div class="total-emissions">
          Total Carbon Footprint: ${emissionTrace.total} kg CO₂e
        </div>

        <div class="standards-note">
          <strong>Standards Compliance:</strong> This Digital Product Passport is generated in compliance with 
          Asset Administration Shell (AAS) standards and is compatible with the Smart Connected Supplier Network (SCSN).
        </div>
      </div>

      ${
        Object.keys(emissionTrace.emissions_subtotal || {}).length > 0
          ? `<div class="section">
          <h2>Emissions by Lifecycle Stage</h2>
          <ul>${formatEmissionsSubtotal(emissionTrace.emissions_subtotal)}</ul>
        </div>`
          : ""
      }

      <div class="section">
        <h2>Detailed Emission Analysis</h2>
        ${renderEmissionTrace(emissionTrace)}
      </div>

      ${
        emissionTrace.mentions && emissionTrace.mentions.length > 0
          ? `<div class="section">
          <h2>Important Notes</h2>
          ${emissionTrace.mentions
            .map((mention: any) => {
              const color =
                mention.mention_class === "Error"
                  ? "#dc2626"
                  : mention.mention_class === "Warning"
                    ? "#ea580c"
                    : "#059669";
              return `<div style="color: ${color}; font-weight: bold; margin: 10px 0; padding: 10px; background: rgba(${
                mention.mention_class === "Error"
                  ? "220, 38, 38"
                  : mention.mention_class === "Warning"
                    ? "234, 88, 12"
                    : "5, 150, 105"
              }, 0.1); border-radius: 4px;">
              ${mention.mention_class}: ${mention.message}
            </div>`;
            })
            .join("")}
        </div>`
          : ""
      }

      <div class="footer">
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Carbon Insight - Digital Product Passport</p>
        <p>This report contains confidential carbon footprint data calculated according to ${emissionTrace.pcf_calculation_method || "ISO 14040/14044"} standards.</p>
        <p>Compatible with Asset Administration Shell (AAS) and Smart Connected Supplier Network (SCSN) specifications.</p>
      </div>
    </body>
    </html>
  `;
}

// Get available export formats with descriptions
export function getExportFormats(): Array<{
  value: ExportFormat;
  label: string;
  description: string;
}> {
  return [
    {
      value: "pdf",
      label: "PDF Report",
      description: "Complete Digital Product Passport report (opens print dialog)",
    },
    {
      value: "aasx",
      label: "AASX Package",
      description: "Asset Administration Shell package (primary DPP format)",
    },
    {
      value: "csv",
      label: "CSV Data",
      description: "Comma-separated values for spreadsheet import",
    },
    {
      value: "xlsx",
      label: "Excel File",
      description: "Microsoft Excel spreadsheet with multiple worksheets",
    },
    {
      value: "aas_xml",
      label: "AAS XML",
      description: "Asset Administration Shell XML format with Digital Nameplate",
    },
    {
      value: "aas_json",
      label: "AAS JSON",
      description: "Asset Administration Shell JSON format",
    },
    {
      value: "scsn_pcf_xml",
      label: "SCSN PCF XML",
      description: "Smart Connected Supplier Network PCF data only (partial)",
    },
    {
      value: "scsn_full_xml",
      label: "SCSN Full XML",
      description: "Complete SCSN XML with placeholders for missing fields",
    },
  ];
}
