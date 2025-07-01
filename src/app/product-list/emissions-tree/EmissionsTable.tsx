"use client";

import { FC, ReactNode, useState, useCallback } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import {
  SquarePlus,
  SquareMinus,
  Building2,
  Truck,
  Users,
  Edit,
  Info,
  Cog,
} from "lucide-react";
import { EmissionTrace } from "@/lib/api/productApi";

export interface EmissionsTableProps {
  emissions: EmissionTrace;
}

interface EmissionTreeItemProps {
  emission: EmissionTrace;
  depth: number;
  quantity: number;
  unit: string;
  isChild: boolean;
  path: string;
  openMap: OpenMap;
  anyRowOpen: boolean;
  toggleRow: (key: string, open: boolean) => void;
  closeDescendants: (path: string) => void;
}

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

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

function getSourceIcon(source: string) {
  switch (source) {
    case "Product":
    case "ProductReference":
      return <Building2 size={16} aria-hidden="true" />;
    case "TransportEmission":
    case "TransportEmissionReference":
      return <Truck size={16} aria-hidden="true" />;
    case "UserEnergyEmission":
    case "UserEnergyEmissionReference":
      return <Users size={16} aria-hidden="true" />;
    case "ProductionEnergyEmission":
    case "ProductionEnergyEmissionReference":
      return <Cog size={16} aria-hidden="true" />;
    default:
      return <Edit size={16} aria-hidden="true" />;
  }
}

function getSourceColor(source: string) {
  switch (source) {
    case "Product":
    case "ProductReference":
      return "#2563eb"; // blue-600
    case "TransportEmission":
    case "TransportEmissionReference":
      return "#f59e42"; // orange-400
    case "UserEnergyEmission":
    case "UserEnergyEmissionReference":
      return "#047857"; // green-700
    case "ProductionEnergyEmission":
    case "ProductionEnergyEmissionReference":
      return "#ef4444" // red-500	
    default:
      return "#6b7280"; // gray-500
  }
}

type OpenMap = Record<string, boolean>;

function getNodeKey(label: string, path: string) {
  // Hopefully this is unique enough
  return `${path}/${label}`;
}

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
  const key = getNodeKey(emission.label, path);
  const isOpen = !!openMap[key];
  const emissionValue = emission.total;
  const hasChildren = (emission.children?.length || 0) + (emission.mentions?.length || 0) > 0;

  const handleClick = () => {
    if (isOpen) {
      closeDescendants(key);
      toggleRow(key, false);
    } else {
      toggleRow(key, true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <>
      <tr data-open={isOpen} className="hover:bg-gray-50 dark:hover:bg-gray-700">
        <td
          className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
          style={{ paddingLeft: `${depth * 25}px` }}
        >
          <div className="px-2 flex items-center">
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
            <span style={{ color: getSourceColor(emission.source) }} aria-hidden="true">
              {getSourceIcon(emission.source)}
            </span>
            <span className="ml-1" aria-label={`${emission.source} source`}>
              {emission.label}
            </span>
          </div>
        </td>
        <td className="px-2 py-2 text-sm text-gray-900 dark:text-white">{emission.methodology}</td>
        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden-when-closed">
          {quantity && (depth > 0 || 
            emission.source === "Product" || 
            emission.source === "ProductReference") 
            ? `${quantity} ${unit}` 
            : ""}
        </td>
        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          <span aria-label={`${emissionValue?.toFixed(3) || 0} kilograms CO2 equivalent`}>
            {emissionValue !== undefined && Number.isFinite(emissionValue)
              ? emissionValue.toFixed(3)
              : "0"}
          </span>
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
        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          <span aria-label={`Total: ${((emissionValue || 0) * quantity).toFixed(3)} kilograms CO2 equivalent`}>
            {emissionValue !== undefined && Number.isFinite(emissionValue) && quantity
              ? `${(emissionValue * quantity).toFixed(3)} kg CO₂-eq`
              : "0"}
          </span>
        </td>
      </tr>
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

export const EmissionsTable: FC<EmissionsTableProps> = ({ emissions }) => {
  const [openMap, setOpenMap] = useState<OpenMap>({});

  // Toggle a row open/closed
  const toggleRow = useCallback((key: string, open: boolean) => {
    setOpenMap(prev => ({ ...prev, [key]: open }));
  }, []);

  // Recursively close all descendants of a node
  const closeDescendants = useCallback((parentKey: string) => {
    setOpenMap(prev => {
      const newMap: OpenMap = { ...prev };
      Object.keys(newMap).forEach(k => {
        if (k.startsWith(parentKey + "/")) {
          newMap[k] = false;
        }
      });
      return newMap;
    });
  }, []);

  const anyRowOpen = Object.values(openMap).some(Boolean);
  const totalEmissionSources = emissions.children?.length || 0;

  return (
    <div className="overflow-x-auto" role="region" aria-label="Emissions breakdown table">
      <table className="min-w-full divide-y overflow-visible" role="table">
        <caption className="sr-only">
          Emissions breakdown showing {totalEmissionSources} emission sources with expandable details
        </caption>
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
      
      {/* Screen reader summary */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {anyRowOpen ? 
          "Some emission details are expanded. Use Enter or Space to toggle expansion." :
          "All emission details are collapsed. Use Enter or Space to expand details."
        }
      </div>
    </div>
  );
};
