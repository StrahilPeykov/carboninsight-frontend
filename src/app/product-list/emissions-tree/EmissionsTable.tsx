"use client";

import { FC, ReactNode, useState, useCallback } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import {
  SquarePlus,
  SquareMinus,
  Building2,
  Truck,
  Box,
  Users,
  BarChart,
  Edit,
  Info,
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
  const iconProps = { size: 16, "aria-hidden": true as const };
  
  switch (source) {
    case "Product":
    case "ProductReference":
      return <Building2 {...iconProps} />;
    case "TransportEmission":
    case "TransportEmissionReference":
      return <Truck {...iconProps} />;
    case "Material":
    case "MaterialReference":
      return <Box {...iconProps} />;
    case "UserEnergy":
    case "UserEnergyReference":
      return <Users {...iconProps} />;
    case "ProductionEnergy":
    case "ProductionEnergyReference":
      return <BarChart {...iconProps} />;
    default:
      return <Edit {...iconProps} />;
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
    case "Material":
    case "MaterialReference":
      return "#10b981"; // green-500
    case "UserEnergy":
    case "UserEnergyReference":
      return "#a21caf"; // purple-700
    case "ProductionEnergy":
    case "ProductionEnergyReference":
      return "#eab308"; // yellow-400
    default:
      return "#6b7280"; // gray-500
  }
}

function getSourceLabel(source: string): string {
  const sourceLabels: Record<string, string> = {
    "Product": "Product emission",
    "ProductReference": "Product reference emission", 
    "TransportEmission": "Transportation emission",
    "TransportEmissionReference": "Transportation reference emission",
    "Material": "Material emission",
    "MaterialReference": "Material reference emission",
    "UserEnergy": "User energy emission",
    "UserEnergyReference": "User energy reference emission",
    "ProductionEnergy": "Production energy emission",
    "ProductionEnergyReference": "Production energy reference emission",
  };
  
  return sourceLabels[source] || "Other emission";
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
  const hasChildren = (emission.children?.length + emission.mentions?.length) > 0;
  const childrenId = `children-${key.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const labelId = `label-${key.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const sourceLabel = getSourceLabel(emission.source);

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
      <tr 
        role="row"
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-level={depth + 1}
        data-open={isOpen} 
        className="hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <td
          role="gridcell"
          className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
          style={{ paddingLeft: `${depth * 25}px` }}
          headers="label-header"
        >
          <div className="px-2 flex items-center">
            {hasChildren && (
              <button 
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                className="mr-2 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${emission.label} emissions breakdown`}
                aria-controls={hasChildren ? childrenId : undefined}
                aria-expanded={isOpen}
                type="button"
              >
                {isOpen ? <SquareMinus size={16} aria-hidden="true" /> : <SquarePlus size={16} aria-hidden="true" />}
              </button>
            )}
            <span 
              style={{ color: getSourceColor(emission.source) }} 
              aria-label={sourceLabel}
              title={sourceLabel}
            >
              {getSourceIcon(emission.source)}
            </span>
            <span className="ml-2" id={labelId}>
              {emission.label}
            </span>
          </div>
        </td>
        <td 
          role="gridcell" 
          className="px-2 py-2 text-sm text-gray-900 dark:text-white"
          headers="methodology-header"
        >
          {emission.methodology}
        </td>
        <td 
          role="gridcell" 
          className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white"
          headers="quantity-header"
        >
          {quantity ? `${quantity} ${unit}` : ""}
        </td>
        <td 
          role="gridcell" 
          className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white"
          headers="emissions-header"
        >
          <div className="flex items-center gap-2">
            <span aria-label={`${emissionValue} kilograms CO2 equivalent`}>
              {emissionValue !== undefined && Number.isFinite(emissionValue)
                ? emissionValue.toFixed(3)
                : ""}
              {emissionValue !== undefined && Number.isFinite(emissionValue) && " kg CO₂e"}
            </span>
            {Object.keys(emission.emissions_subtotal || {}).length > 0 && (
              <Tooltip
                content={
                  <div role="tooltip">
                    <div className="font-semibold mb-2">Emissions by Lifecycle Stage:</div>
                    {Object.entries(emission.emissions_subtotal).map(([stage, factor]) => (
                      <div key={stage} className="mb-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{stage}</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          Biogenic: {factor.biogenic.toFixed(2)} kg CO₂e
                          <br />
                          Non-biogenic: {factor.non_biogenic.toFixed(2)} kg CO₂e
                        </p>
                      </div>
                    ))}
                  </div>
                }
              >
                <Info className="w-4 h-4 text-gray-400" aria-label="Show emissions breakdown by lifecycle stage" />
              </Tooltip>
            )}
          </div>
        </td>
      </tr>
      {isOpen && (
        <>
          {emission.children?.map((child, idx) => (
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
          {emission.mentions?.map((mention, idx) => (
            <tr key={`mention-${key}-${idx}`} role="row">
              <td 
                colSpan={4} 
                className="py-2 text-sm font-medium text-gray-900 dark:text-white"
                style={{ paddingLeft: `${(depth + 1) * 25 + 20}px` }}
                role="note"
                aria-label={`${mention.mention_class} message`}
              >
                <div className="flex items-center">
                  <span 
                    className={`px-2 py-1 rounded text-xs font-bold mr-2 ${
                      mention.mention_class === 'Error' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : mention.mention_class === 'Warning'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}
                  >
                    {mention.mention_class}
                  </span>
                  <span>{mention.message}</span>
                </div>
              </td>
            </tr>
          ))}
        </>
      )}
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

  return (
    <div className="overflow-x-auto" role="region" aria-label="Product emissions breakdown table">
      <table 
        role="treegrid" 
        aria-label="Product emissions breakdown with expandable categories"
        className="min-w-full divide-y overflow-visible"
      >
        <thead className="border-b text-black dark:text-white">
          <tr role="row">
            <th 
              scope="col" 
              id="label-header"
              className="p-2 text-left text-sm font-medium"
            >
              Label
            </th>
            <th 
              scope="col" 
              id="methodology-header"
              className="p-2 text-left text-sm font-medium"
            >
              Methodology
            </th>
            <th 
              scope="col" 
              id="quantity-header"
              className="p-2 text-left text-sm font-medium"
            >
              Quantity
            </th>
            <th 
              scope="col" 
              id="emissions-header"
              className="p-2 text-left text-sm font-medium"
            >
              Emissions (kg CO₂e)
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
    </div>
  );
};
