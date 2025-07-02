// ──────────────────────────────────────────────────────────────
// useTabConfig – initializes tab metadata and tab references
// Used by ProductClientPage to manage step-based navigation
// ──────────────────────────────────────────────────────────────
import { useRef } from "react";
import dynamic from "next/dynamic";
import { ComponentType, RefAttributes } from "react";
import { TabHandle } from "@/app/product-list/product/page";

// ── Dynamic tab component imports (to prevent SSR issues) ─────
const ProductInfo = dynamic(() => import("@/app/product-list/product/tabs/product-info"), { ssr: false });
const BillOfMaterials = dynamic(() => import("@/app/product-list/product/tabs/bill-of-materials"), { ssr: false });
const ProductionEnergy = dynamic(() => import("@/app/product-list/product/tabs/production-energy"), { ssr: false });
const UserEnergy = dynamic(() => import("@/app/product-list/product/tabs/user-energy"), { ssr: false });
const Transportation = dynamic(() => import("@/app/product-list/product/tabs/transportation"), { ssr: false });

// ── Tab configuration structure used by ProductClientPage ─────
export type TabConfigItem = {
  key: string; // Unique key identifier for the tab
  ref: React.RefObject<TabHandle | null>; // Ref to call save/update methods from parent
  Comp: ComponentType<any> & RefAttributes<TabHandle>; // Component associated with the tab
  label: string; // Display label for the stepper UI
  saved: boolean; // Whether this tab is currently saved
  disabled: boolean; // Whether this tab is disabled
  errorBannerText: string; // Inline validation error (if any)
};

 // ── Initializes tab state and references to be used in ProductClientPage ─
export function useTabConfig() {
  // Ref to access save/update methods in the ProductInfo tab
  const productInfoRef = useRef<TabHandle | null>(null);
  // Ref to access save/update methods in the BillOfMaterials tab
  const billOfMaterialsRef = useRef<TabHandle | null>(null);
  // Ref to access save/update methods in the ProductionEnergy tab
  const productionEnergyRef = useRef<TabHandle | null>(null);
  // Ref to access save/update methods in the UserEnergy tab
  const userEnergyRef = useRef<TabHandle | null>(null);
  // Ref to access save/update methods in the Transportation tab
  const transportationRef = useRef<TabHandle | null>(null);

  // Initial tab configurations with default UI and state values
  const initialTabs: TabConfigItem[] = [
    { key: "productInfo", ref: productInfoRef, label: "Product Information", Comp: ProductInfo, saved: false, disabled: false, errorBannerText: "" },
    { key: "billOfMaterials", ref: billOfMaterialsRef, label: "Bill of Materials", Comp: BillOfMaterials, saved: false, disabled: true, errorBannerText: "" },
    { key: "productionEnergy", ref: productionEnergyRef, label: "Production Energy", Comp: ProductionEnergy, saved: false, disabled: true, errorBannerText: "" },
    { key: "userEnergy", ref: userEnergyRef, label: "User Energy", Comp: UserEnergy, saved: false, disabled: true, errorBannerText: "" },
    { key: "transportation", ref: transportationRef, label: "Transportation", Comp: Transportation, saved: false, disabled: true, errorBannerText: "" },
  ];

  // Return the tab configurations and refs to the calling component
  return {
    initialTabs,
    refs: {
      productInfoRef,
      billOfMaterialsRef,
      productionEnergyRef,
      userEnergyRef,
      transportationRef,
    },
  };
}