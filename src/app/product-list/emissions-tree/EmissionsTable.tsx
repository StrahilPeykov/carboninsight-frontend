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
        <td className="px-2 py-2 text-sm text-gray-900 dark:text-white">{emission.methodology}</td>
        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden-when-closed">
          {quantity ? `${quantity} ${unit}` : ""}
        </td>
        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          {emissionValue !== undefined && Number.isFinite(emissionValue)
            ? emissionValue.toFixed(3)
            : ""}
          {"\u00A0"}
          {Object.keys(emission.emissions_subtotal || {}).length > 0 && (
            <Tooltip
              content={
                <div>
                  {Object.entries(emission.emissions_subtotal).map(([stage, factor]) => (
                    <div key={stage} className="mb-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{stage}</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        Bio: {factor.biogenic.toFixed(2)}
                        <br />
                        Non-bio: {factor.non_biogenic.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              }
            >
              <Info className="w-4 h-4 text-gray-400" />
            </Tooltip>
          )}
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
      <table className="min-w-full divide-y overflow-visible">
        <thead className="border-b text-black dark:text-white">
          <tr>
            <th scope="col" className="p-2 text-left text-sm font-medium">
              Label
            </th>
            <th scope="col" className="p-2 text-left text-sm font-medium">
              Methodology
            </th>
            <th className="p-2 text-left text-sm font-medium">Quantity</th>
            <th scope="col" className="p-2 text-left text-sm font-medium">
              Emissions (kg CO2e)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-white">
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
