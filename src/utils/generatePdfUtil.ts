import { Product } from "@/lib/api/productApi";

// Main function that generates HTML for PDF reports
// Takes product data and emission trace data
// and returns an HTML string
// This HTML can be rendered in a new window and printed as PDF
export function generatePDFReportHTML(product: Product, emissionTrace: any): string {
  // Helper function to format the emissions subtotal section
  // Converts the emissions data object into HTML list items showing biogenic and non-biogenic values
  const formatEmissionsSubtotal = (
    subtotal: Record<string, { biogenic: number; non_biogenic: number }>
  ): string => {
    return Object.entries(subtotal)
      // Convert the object into array of [key, value] pairs for mapping
      // This allows us to process each lifecycle stage individually
      .map(([stage, value]) => {
        // Calculate the total emissions by adding biogenic and non-biogenic values
        // Format to 2 decimal places for consistent presentation
        const total = (value.biogenic + value.non_biogenic).toFixed(2);
        
        // Format individual biogenic emissions to 2 decimal places
        // Biogenic emissions are from biological sources (e.g. plant decomposition)
        const biogenic = value.biogenic.toFixed(2);
        
        // Format individual non-biogenic emissions to 2 decimal places
        // Non-biogenic emissions are from non-biological sources (e.g. fossil fuels)
        const non_biogenic = value.non_biogenic.toFixed(2);
        
        // Generate HTML list item for this lifecycle stage with nested details
        // The stage name is displayed prominently with the total
        // Biogenic and non-biogenic values are shown as
        // sub-items with bullet points
        return `<li>
                  ${stage}: ${total} kg CO₂-eq<br />
                  <span style="font-size: 0.9em;">
                    • Biogenic: ${biogenic} kg CO₂-eq <br/>
                    • Non-biogenic: ${non_biogenic} kg CO₂-eq
                  </span>
                </li>`;
      })
      // Combine all HTML list items into a single string
      // The empty string separator ensures items appear consecutively in the DOM
      .join("");
  };

  // Helper function to identify if a trace represents an emission
  // Used to determine how to format certain elements in the report
  const traceIsAnEmission = (trace: any): boolean => {
    return (
      trace.label === "Transport Emission" ||
      trace.label === "Production energy consumption emission" ||
      trace.label === "User energy consumption emission"
    );
  }

  // Recursive function to render the emission trace hierarchy
  // Each trace can have child traces, and this function handles
  // the nested structure
  // The depth parameter is used for indentation levels in the UI
  // Optional quantity parameter shows quantity for non-emission traces
  const renderEmissionTrace = (trace: any, depth: number = 0, quantity?: number): string => {
    // Calculate left margin based on the hierarchical depth - 
    // increases indentation for nested items
    // 20px per level provides clear visual hierarchy without taking too much horizontal space
    const marginLeft = depth * 20;

    // Extract and calculate emission totals from the trace's subtotal data
    // This handles cases where the emissions_subtotal might have multiple lifecycle stages
    const subtotal: { biogenic: number; non_biogenic: number }[] = Object.values(
      trace.emissions_subtotal
    );
    // Calculate total biogenic emissions and format to 2 decimal places for consistency
    const totalBiogenic = subtotal.reduce((sum, vals) => sum + vals.biogenic, 0).toFixed(2);
    // Calculate total non-biogenic emissions with the same formatting
    const totalNonBiogenic = subtotal.reduce((sum, vals) => sum + vals.non_biogenic, 0).toFixed(2);

    // Begin constructing the HTML representation of this trace node
    // Each trace is wrapped in a div with appropriate indentation and styling
    let html = `
      <div style="margin-left: ${marginLeft}px; margin-bottom: 15px; border-left: ${depth > 0 ? "2px solid #e5e5e5" : "none"}; padding-left: ${depth > 0 ? "15px" : "0"};">
        <h${Math.min(depth + 3, 6)} 
          style="color: #c20016; margin-bottom: 8px;">
          ${
            // Only show quantity and unit for non-emission traces when quantity is provided
            // This prevents redundant information for direct emission entries
            !traceIsAnEmission(trace)
              ? quantity !== undefined
                ? `${quantity} ${trace.reference_impact_unit} `
                : ""
              : ""
          }
          ${trace.label}
        </h${Math.min(depth + 3, 6)}>

        ${
          // Conditionally show methodology information if available
          // This provides transparency about the calculation methods used
          trace.methodology ? `<p><strong>Method:</strong> ${trace.methodology}</p>` : ""
        }
        
        <p style="font-weight: bold; font-size: 1.1em;">
          Total: ${trace.total} kg CO₂-eq <br/>
          <span style="font-size: 0.9em; font-weight: normal;">
            • Biogenic: ${totalBiogenic} kg CO₂-eq <br/>
            • Non-biogenic: ${totalNonBiogenic} kg CO₂-eq
          </span>
        </p>
        
        ${
          // Show lifecycle stage breakdown only if emissions_subtotal contains data
          // This prevents showing empty sections in the report
          Object.keys(trace.emissions_subtotal || {}).length > 0
            ? `<div>
            <strong>Breakdown by Lifecycle Stage:</strong>
            <ul style="margin: 5px 0;">${formatEmissionsSubtotal(trace.emissions_subtotal)}</ul>
          </div>`
            : ""
        }
        
        ${
          // Show warning/error messages if present
          // These are critical context messages that help explain issues or special considerations
          trace.mentions && trace.mentions.length > 0
            ? trace.mentions
                .map((mention: any) => {
                  // Color-code messages by severity for better visual distinction
                  // Red for errors, orange for warnings, green for informational messages
                  const color =
                    mention.mention_class === "Error"
                      ? "#dc2626"  // Red for errors
                      : mention.mention_class === "Warning"
                        ? "#ea580c"  // Orange for warnings
                        : "#059669";  // Green for info/success
                  return `<div style="color: ${color}; font-weight: bold; margin: 5px 0;">
              ${mention.mention_class}: ${mention.message}
            </div>`;
                })
                .join("")
            : ""
        }
      </div>

      <div style="border-top: 3px solid #999; margin: 30px 0;"></div>
    `;

    // Recursively render all children of this trace
    if (trace.children && trace.children.length > 0) {
      trace.children.forEach((child: any) => {
        html += renderEmissionTrace(child.emission_trace, depth + 1, child.quantity);
      });
    }

    return html;
  };

  // Calculate total biogenic and non-biogenic emissions from the subtotals
  // These totals are used in the summary section of the report
  type EmissionEntry = { biogenic: number; non_biogenic: number };
  const values = Object.values(emissionTrace.emissions_subtotal) as EmissionEntry[];
  let totalBiogenic = 0;
  let totalNonBiogenic = 0;
  values.forEach(entry => {
    totalBiogenic += entry.biogenic;
    totalNonBiogenic += entry.non_biogenic;
  });

  // Build the complete HTML document with CSS styling
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Carbon Footprint Report - ${product.name}</title>
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
          font-size: 1.3em;
          font-weight: bold;
          color: #2d5a27;
          margin: 20px 0;
          display: flex;
          justify-content: center;
        }
        .emissions-text {
          text-align: left;
          width: fit-content;    
        }
        .emissions-subtext {
          color: #666;
          font-size: 0.9em;
          font-weight: normal;
        }
        .footer {
          text-align: center;
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #e5e5e5;
          color: #666;
          font-size: 0.9em;
        }
        ul {
          list-style-type: disc;
          margin-left: 20px;
        }
      </style>
    </head>
    <body>
      <!-- Header section with report title -->
      <div class="header">
        <h1>Carbon Footprint Report</h1>
      </div>

      <!-- Product details section -->
      <div class="section">
        <h2>Product Information</h2>
        <div class="product-info">
          <table>
            <tr><td>Product Name:</td><td>${product.name}</td></tr>
            <tr><td>SKU:</td><td>${product.sku}</td></tr>
            <tr><td>Description:</td><td>${product.description}</td></tr>
            <tr><td>Manufacturer:</td><td>${product.manufacturer_name}</td></tr>
            <tr><td>Total Emissions:</td><td>${product.emission_total} kg CO₂-eq</td></tr>
            <tr><td>PCF Calculation Method:</td><td>${emissionTrace.pcf_calculation_method || "ISO 14040/14044"}</td></tr>
            <tr><td>Reference Impact Unit:</td><td>${emissionTrace.reference_impact_unit || "piece"}</td></tr>
          </table>
        </div>
        
        <!-- Emissions summary with biogenic/non-biogenic breakdown -->
        <div class="total-emissions">
          <div class="emissions-text">
            Total Carbon Footprint: ${emissionTrace.total} kg CO₂-eq <br/>
            <span class="emissions-subtext">
              • Biogenic: ${totalBiogenic.toFixed(2)} kg CO₂-eq <br/>
              • Non-biogenic: ${totalNonBiogenic.toFixed(2)} kg CO₂-eq
            </span>
          </div>
        </div>
      </div>

      <!-- Conditional lifecycle stage emissions section (only shown if data exists) -->
      ${
        Object.keys(emissionTrace.emissions_subtotal || {}).length > 0
          ? `<div class="section">
          <h2>Emissions by Lifecycle Stage</h2>
          <ul>${formatEmissionsSubtotal(emissionTrace.emissions_subtotal)}</ul>
        </div>`
          : ""
      }

      <!-- Detailed emissions tree view section -->
      <div class="section">
        <h2>Detailed Emission Analysis</h2>
        ${renderEmissionTrace(emissionTrace)}
      </div>

      <!-- Conditional warning/error notes section (only shown if mentions exist) -->
      ${
        emissionTrace.mentions && emissionTrace.mentions.length > 0
          ? `<div class="section">
          <h2>Important Notes</h2>
          ${emissionTrace.mentions
            .map((mention: any) => {
              // Color-code based on message severity (error, warning, info)
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

      <!-- Report footer with timestamp and disclaimer -->
      <div class="footer">
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>CarbonInsight - Carbon Footprint Report</p>
        <p>This report contains confidential carbon footprint data calculated according to ${emissionTrace.pcf_calculation_method || "ISO 14040/14044"} standards.</p>
      </div>
    </body>
    </html>
  `;
}
