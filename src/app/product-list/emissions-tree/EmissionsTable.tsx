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

export interface EmissionTrace {
  total: number;
  label: string;
  reference_impact_unit: "g" | "kg" | "t" | "ml" | "l" | "m3" | "m2" | "pc" | "kWh" | "Other";
  source:
    | "Product"
    | "ProductReference"
    | "TransportEmission"
    | "TransportEmissionReference"
    | "Material"
    | "MaterialReference"
    | "UserEnergy"
    | "UserEnergyReference"
    | "ProductionEnergy"
    | "ProductionEnergyReference"
    | "Other"
    | "OtherReference";
  methodology: string;
  emissions_subtotal: { [key: string]: number };
  children: {
    emission_trace: EmissionTrace;
    quantity: number;
  }[];
  mentions: { mention_class: "Information" | "Warning" | "Error"; message: string }[];
}

export interface EmissionsTableProps {
  emissions: EmissionTrace;
}

interface EmissionTreeItemProps {
  emission: EmissionTrace;
  depth: number;
  quantity: number;
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
          className="z-50 rounded bg-gray-800 text-white text-xs px-3 py-1 shadow-lg"
          sideOffset={6}
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
      return <Building2 size={16} />;
    case "TransportEmission":
    case "TransportEmissionReference":
      return <Truck size={16} />;
    case "Material":
    case "MaterialReference":
      return <Box size={16} />;
    case "UserEnergy":
    case "UserEnergyReference":
      return <Users size={16} />;
    case "ProductionEnergy":
    case "ProductionEnergyReference":
      return <BarChart size={16} />;
    default:
      return <Edit size={16} />;
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

type OpenMap = Record<string, boolean>;

function getNodeKey(label: string, path: string) {
  // Hopefully this is unique enough
  return `${path}/${label}`;
}

export const EmissionTreeItem: FC<EmissionTreeItemProps> = ({
  emission,
  depth = 0,
  quantity = 1,
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

  const handleClick = () => {
    if (isOpen) {
      closeDescendants(key);
      toggleRow(key, false);
    } else {
      toggleRow(key, true);
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
            {emission.children?.length + emission.mentions?.length > 0 && (
              <button onClick={handleClick} className="mr-2">
                {isOpen ? <SquareMinus size={16} /> : <SquarePlus size={16} />}
              </button>
            )}
            <span style={{ color: getSourceColor(emission.source) }}>
              {getSourceIcon(emission.source)}
            </span>
            {"\u00A0"}
            {emission.label}
          </div>
        </td>
        <td className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
          {emission.methodology}
        </td>
        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden-when-closed">
          {quantity}
        </td>
        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          {emissionValue !== undefined && Number.isFinite(emissionValue)
            ? emissionValue.toFixed(2)
            : ""}
          {"\u00A0"}
          <Tooltip
            content={
              <div>
                {Object.entries(emission.emissions_subtotal).map(([stage, factor]) => (
                  <p key={stage} className="mb-0.5">
                    {stage}: {factor}
                  </p>
                ))}
              </div>
            }
          >
            <Info className="w-4 h-4 text-gray-400" />
          </Tooltip>
        </td>
      </tr>
      {isOpen &&
        emission.children?.map((child, idx) => (
          <EmissionTreeItem
            key={getNodeKey(child.emission_trace.label, `${key}/${idx}`)}
            emission={child.emission_trace}
            depth={depth + 1}
            quantity={child.quantity}
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
            >
              <div className="flex items-center">
                <span className="px-2 font-bold">{mention.mention_class}:</span>
                {"\u00A0"}
                {mention.message}
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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 overflow-visible">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              scope="col"
              className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
            >
              Label
            </th>
            <th
              scope="col"
              className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
            >
              Methodology
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Quantity
            </th>
            <th
              scope="col"
              className="px-2 py-2 text-left text-xs font-medium text-gray-500 tracking-wider dark:text-gray-400"
            >
              EMISSIONS (kg CO2e)
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {emissions.children.map((child, index) => (
            <EmissionTreeItem
              key={getNodeKey(child.emission_trace.label, `${index}`)}
              emission={child.emission_trace}
              depth={0}
              quantity={child.quantity}
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
