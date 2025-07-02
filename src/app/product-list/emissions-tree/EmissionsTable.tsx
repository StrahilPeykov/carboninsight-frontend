"use client";

// Import React hooks and TypeScript types for component development
import { FC, ReactNode, useState, useCallback } from "react";
// Import Radix UI tooltip components for accessible tooltips
import * as RadixTooltip from "@radix-ui/react-tooltip";
// Import Lucide icons for visual indicators of emission types and interactive controls
import {
  SquarePlus, // Used for expand row control
  SquareMinus, // Used for collapse row control
  Building2, // Represents Product emission sources
  Truck, // Represents Transport emission sources
  Users, // Represents User Energy emission sources
  Edit, // Default icon for unspecified sources
  Info, // Used for tooltip/additional information indicators
  Cog, // Represents Production Energy emission sources
} from "lucide-react";
// Import product API types for emissions data structure
import { EmissionTrace } from "@/lib/api/productApi";

// Main props interface for the EmissionsTable component
export interface EmissionsTableProps {
  // The root emissions data structure containing the hierarchical breakdown
  emissions: EmissionTrace;
}

// Props interface for individual emission tree items/rows
interface EmissionTreeItemProps {
  // The emission data for this specific row
  emission: EmissionTrace;
  // Nesting level for proper indentation and hierarchy visualization
  depth: number;
  // Quantity value for calculation of total impact (emissions × quantity)
  quantity: number;
  // Unit of measurement for the quantity value (e.g., kg, pieces)
  unit: string;
  // Indicates whether this is a child node in the emissions hierarchy
  isChild: boolean;
  // Unique path string used for tracking the position in the tree hierarchy
  path: string;
  // Map of open/closed state for all tree nodes, keyed by node path
  openMap: OpenMap;
  // Flag indicating if any row in the entire table is currently expanded
  anyRowOpen: boolean;
  // Function to toggle a specific row's expanded/collapsed state
  toggleRow: (key: string, open: boolean) => void;
  // Function to recursively close all child nodes of a specific parent
  closeDescendants: (path: string) => void;
}

// Props interface for reusable tooltip component
interface TooltipProps {
  // The content to display inside the tooltip
  content: ReactNode;
  // The element that triggers the tooltip on hover/focus
  children: ReactNode;
}

// Reusable tooltip component that wraps Radix UI tooltip functionality
// Provides consistent styling and behavior for all tooltips in the table
export const Tooltip: FC<TooltipProps> = ({ content, children }) => (
  <RadixTooltip.Provider>
    <RadixTooltip.Root delayDuration={100}>
      <RadixTooltip.Trigger asChild>
        <span className="inline-flex items-center cursor-pointer">{children}</span>
      </RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side="bottom"
          align="center"
          className="z-50 rounded bg-gray-100 dark:bg-gray-900 text-white text-xs px-3 py-1 shadow-lg"
          sideOffset={6}
          role="tooltip"
        >
          {content}
          <RadixTooltip.Arrow className="fill-gray-800" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  </RadixTooltip.Provider>
);

// Helper function to determine which icon to display based on the emission source type
// Provides visual cues to help users quickly identify different emission categories
function getSourceIcon(source: string) {
  switch (source) {
    case "Product":
    case "ProductReference":
      // Building icon for product-based emissions
      return <Building2 size={16} aria-hidden="true" />;
    case "TransportEmission":
    case "TransportEmissionReference":
      // Truck icon for transport-related emissions
      return <Truck size={16} aria-hidden="true" />;
    case "UserEnergyEmission":
    case "UserEnergyEmissionReference":
      // Users icon for energy consumption during product use
      return <Users size={16} aria-hidden="true" />;
    case "ProductionEnergyEmission":
    case "ProductionEnergyEmissionReference":
      // Cog icon for energy consumption during manufacturing
      return <Cog size={16} aria-hidden="true" />;
    default:
      // Edit icon as fallback for any unspecified source types
      return <Edit size={16} aria-hidden="true" />;
  }
}

// Helper function to determine the color to use for each emission source type
// Creates consistent visual categorization across the emissions hierarchy
function getSourceColor(source: string) {
  switch (source) {
    case "Product":
    case "ProductReference":
      // Blue color for product-based emissions
      return "#2563eb"; // blue-600
    case "TransportEmission":
    case "TransportEmissionReference":
      // Orange color for transport-related emissions
      return "#f59e42"; // orange-400
    case "UserEnergyEmission":
    case "UserEnergyEmissionReference":
      // Green color for user energy emissions
      return "#047857"; // green-700
    case "ProductionEnergyEmission":
    case "ProductionEnergyEmissionReference":
      // Red color for production energy emissions
      return "#ef4444" // red-500	
    default:
      // Gray color as fallback for any unspecified source types
      return "#6b7280"; // gray-500
  }
}

// Type definition for tracking open/closed state of tree nodes
// Keys are node paths, values are boolean flags (true = open, false = closed)
type OpenMap = Record<string, boolean>;

// Helper function to generate a unique key for each node in the emissions tree
// Combines the node label and path to ensure uniqueness throughout the tree
function getNodeKey(label: string, path: string) {
  // Hopefully this is unique enough
  return `${path}/${label}`;
}

// Component for rendering individual emission tree items (rows)
// Handles expansion/collapse, hierarchy visualization, and emissions calculations
export const EmissionTreeItem: FC<EmissionTreeItemProps> = ({
  emission,
  depth = 0,
  quantity = 1,
  unit,
  isChild = false,
  path,
  openMap,
  anyRowOpen,
  toggleRow,
  closeDescendants,
}) => {
  // Generate unique key for this tree node
  const key = getNodeKey(emission.label, path);
  // Check if this node is currently expanded
  const isOpen = !!openMap[key];
  // Extract the emission value from the data
  const emissionValue = emission.total;
  // Determine if this node has children or mentions that can be expanded
  const hasChildren = (emission.children?.length || 0) + (emission.mentions?.length || 0) > 0;

  // Handler for click events on the expand/collapse button
  const handleClick = () => {
    if (isOpen) {
      // If already open, close this node and all its descendants
      closeDescendants(key);
      toggleRow(key, false);
    } else {
      // If closed, open this node
      toggleRow(key, true);
    }
  };

  // Handler for keyboard navigation - allows using Enter or Space to expand/collapse
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <>
      {/* Main row for this emission item */}
      <tr data-open={isOpen} className="hover:bg-gray-50 dark:hover:bg-gray-700">
        <td
          className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
          style={{ paddingLeft: `${depth * 25}px` }}
        >
          <div className="px-2 flex items-center">
            {/* Expandable toggle button - only shown if the node has children */}
            {hasChildren && (
              <button 
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                className="mr-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-expanded={isOpen}
                aria-label={`${isOpen ? 'Collapse' : 'Expand'} details for ${emission.label}`}
                type="button"
              >
                {isOpen ? 
                  <SquareMinus size={16} aria-hidden="true" /> : 
                  <SquarePlus size={16} aria-hidden="true" />
                }
              </button>
            )}
            {/* Icon representing the emission source type */}
            <span style={{ color: getSourceColor(emission.source) }} aria-hidden="true">
              {getSourceIcon(emission.source)}
            </span>
            {/* Emission source label with appropriate aria label */}
            <span className="ml-1" aria-label={`${emission.source} source`}>
              {emission.label}
            </span>
          </div>
        </td>
        {/* Methodology column showing the calculation method used */}
        <td className="px-2 py-2 text-sm text-gray-900 dark:text-white">{emission.methodology}</td>
        {/* Quantity column - only shown for certain types and depths */}
        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden-when-closed">
          {quantity && (depth > 0 || 
            emission.source === "Product" || 
            emission.source === "ProductReference") 
            ? `${quantity} ${unit}` 
            : ""}
        </td>
        {/* Per-unit emissions column with tooltips for detailed breakdown */}
        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          <span aria-label={`${emissionValue?.toFixed(3) || 0} kilograms CO2 equivalent`}>
            {emissionValue !== undefined && Number.isFinite(emissionValue)
              ? emissionValue.toFixed(3)
              : "0"}
          </span>
          {/* Information tooltip showing emissions breakdown by lifecycle stage */}
          {Object.keys(emission.emissions_subtotal || {}).length > 0 && (
            <Tooltip
              content={
                <div role="tooltip">
                  <h4 className="font-semibold dark:text-gray-100 text-black mb-1">Emissions by Stage:</h4>
                  {Object.entries(emission.emissions_subtotal).map(([stage, factor]) => (
                    <div key={stage} className="mb-1">
                      <p className="font-semibold dark:text-gray-100 text-black">{stage}</p>
                      <p className="text-sm dark:text-gray-200 text-black">
                        Bio: {factor.biogenic.toFixed(2)}
                        <br />
                        Non-bio: {factor.non_biogenic.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              }
            >
              <Info className="w-4 h-4 text-gray-400 ml-1 inline" />
            </Tooltip>
          )}
        </td>
        {/* Total emissions column (per-unit emissions × quantity) */}
        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          <span aria-label={`Total: ${((emissionValue || 0) * quantity).toFixed(3)} kilograms CO2 equivalent`}>
            {emissionValue !== undefined && Number.isFinite(emissionValue) && quantity
              ? `${(emissionValue * quantity).toFixed(3)} kg CO₂-eq`
              : "0"}
          </span>
        </td>
      </tr>
      {/* Child rows - only rendered if this node is expanded */}
      {isOpen &&
        emission.children?.map((child, idx) => (
          <EmissionTreeItem
            key={getNodeKey(child.emission_trace.label, `${key}/${idx}`)}
            emission={child.emission_trace}
            depth={depth + 1}
            quantity={child.quantity}
            unit={child.emission_trace.reference_impact_unit}
            isChild={true}
            path={`${key}/${idx}`}
            openMap={openMap}
            anyRowOpen={anyRowOpen}
            toggleRow={toggleRow}
            closeDescendants={closeDescendants}
          />
        ))}
      {/* Mention rows - additional informational items attached to this node */}
      {isOpen &&
        emission.mentions?.map((mention, idx) => (
          <tr key={`mention-${key}-${idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td
              colSpan={5}
              className="py-2 text-sm font-medium text-gray-900 dark:text-white"
              style={{ paddingLeft: `${(depth + 1) * 25}px` }}
              role="cell"
            >
              <div className="flex items-center">
                <span className="px-2 font-bold" aria-label={`${mention.mention_class} message`}>
                  {mention.mention_class}:
                </span>
                <span className="ml-1">{mention.message}</span>
              </div>
            </td>
          </tr>
        ))}
    </>
  );
};

// Main emissions table component that displays the hierarchical tree of emission sources
// Manages the expand/collapse state and renders the table structure
export const EmissionsTable: FC<EmissionsTableProps> = ({ emissions }) => {
  // State to track which rows are expanded (open) in the tree
  const [openMap, setOpenMap] = useState<OpenMap>({});

  // Memoized function to toggle a row's expanded state
  // Using useCallback to prevent unnecessary re-renders
  const toggleRow = useCallback((key: string, open: boolean) => {
    setOpenMap(prev => ({ ...prev, [key]: open }));
  }, []);

  // Memoized function to recursively close all descendants of a node
  // When a parent node is collapsed, all its children should also be collapsed
  const closeDescendants = useCallback((parentKey: string) => {
    setOpenMap(prev => {
      const newMap: OpenMap = { ...prev };
      Object.keys(newMap).forEach(k => {
        // Check if this key is a descendant of the parent key
        if (k.startsWith(parentKey + "/")) {
          newMap[k] = false;
        }
      });
      return newMap;
    });
  }, []);

  // Check if any row in the entire table is currently expanded
  const anyRowOpen = Object.values(openMap).some(Boolean);
  // Count total emission sources for screen reader information
  const totalEmissionSources = emissions.children?.length || 0;

  return (
    <div className="overflow-x-auto" role="region" aria-label="Emissions breakdown table">
      <table className="min-w-full divide-y overflow-visible" role="table">
        {/* Table caption for screen readers providing context about the table */}
        <caption className="sr-only">
          Emissions breakdown showing {totalEmissionSources} emission sources with expandable details
        </caption>
        {/* Table header with column labels */}
        <thead className="border-b text-black dark:text-white">
          <tr role="row">
            <th scope="col" className="p-2 text-left text-sm font-medium">
              Label
            </th>
            <th scope="col" className="p-2 text-left text-sm font-medium">
              Methodology
            </th>
            <th scope="col" className="p-2 text-left text-sm font-medium">
              Quantity
            </th>
            <th scope="col" className="p-2 text-left text-sm font-medium">
              Emissions
            </th>
            <th scope="col" className="p-2 text-left text-sm font-medium">
              Total
            </th>
          </tr>
        </thead>
        {/* Table body containing all emission tree items */}
        <tbody className="divide-y dark:divide-white" role="rowgroup">
          {emissions.children.map((child, index) => (
            <EmissionTreeItem
              key={getNodeKey(child.emission_trace.label, `${index}`)}
              emission={child.emission_trace}
              depth={0}
              quantity={child.quantity}
              unit={child.emission_trace.reference_impact_unit}
              isChild={false}
              path={`${index}`}
              openMap={openMap}
              anyRowOpen={anyRowOpen}
              toggleRow={toggleRow}
              closeDescendants={closeDescendants}
            />
          ))}
        </tbody>
      </table>
      
      {/* Screen reader announcement about expansion state - improves accessibility */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {anyRowOpen ? 
          "Some emission details are expanded. Use Enter or Space to toggle expansion." :
          "All emission details are collapsed. Use Enter or Space to expand details."
        }
      </div>
    </div>
  );
};
