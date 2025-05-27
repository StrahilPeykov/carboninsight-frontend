"use client";

import {
  useRef,
  useState,
  ForwardRefExoticComponent,
  RefAttributes,
  Suspense,
  useEffect,
} from "react";

import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/react";
import { CircleAlert } from "lucide-react";

import dynamic from "next/dynamic";

const ProductInfo = dynamic(() => import("./tabs/product-info"), { ssr: false });
const BillOfMaterials = dynamic(() => import("./tabs/bill-of-materials"), { ssr: false });
const ProductionEnergy = dynamic(() => import("./tabs/production-energy"), { ssr: false });
const UserEnergy = dynamic(() => import("./tabs/user-energy"), { ssr: false });
const Transportation = dynamic(() => import("./tabs/transportation"), { ssr: false });

import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import { useRouter } from "next/navigation";
import { Mode } from "./enums";

// API URL from environment variables with fallback
const URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
console.log("API URL:", URL);

export interface TabHandle {
  /** called by parent when Save & Next is clicked */
  saveTab(): Promise<string>;
  updateTab(): Promise<string>;
}

export type DataPassedToTabs = {
  productId: string;
  tabKey: string;
  mode: Mode;
  setProductId: (id: string) => void;
  onFieldChange: () => void;
};

export default function ProductClientPage() {
  // ---- grab product_id from URL once on mount ----
  const [productId, setProductId] = useState<string>("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("product_id") ?? "";
    setProductId(id);
    console.log("Product ID from URL:", id);
    setMode(id ? Mode.EDIT : Mode.ADD);
  }, []);

  const [mode, setMode] = useState<Mode>(Mode.ADD);

  useEffect(() => {
    if (mode === Mode.EDIT) {
      // set all tabs to saved
      setTabConfig(cfg =>
        cfg.map(tab => ({ ...tab, saved: true, disabled: false, errorBannerText: "" }))
      );
    }
  }, [mode]);

  const router = useRouter();

  // create one ref per tab
  const productInfoRef = useRef<TabHandle | null>(null);
  const billOfMaterialsRef = useRef<TabHandle | null>(null);
  const productionEnergyRef = useRef<TabHandle | null>(null);
  const userEnergyRef = useRef<TabHandle | null>(null);
  const transportationRef = useRef<TabHandle | null>(null);

  type TabConfigItem = {
    key: string;
    ref: React.RefObject<TabHandle | null>;
    Comp: React.ComponentType<DataPassedToTabs & RefAttributes<TabHandle>>;
    label: string;
    saved: boolean;
    disabled: boolean;
    errorBannerText: string;
  };

  // 1) The ordered array for rendering:
  const [tabConfig, setTabConfig] = useState<TabConfigItem[]>([
    {
      key: "productInfo",
      ref: productInfoRef,
      label: "Product Information",
      Comp: ProductInfo,
      saved: false,
      disabled: false, // first tab always enabled
      errorBannerText: "",
    },
    {
      key: "billOfMaterials",
      ref: billOfMaterialsRef,
      label: "Bill of Materials",
      Comp: BillOfMaterials,
      saved: false,
      disabled: true, // disabled until productInfo is saved
      errorBannerText: "",
    },
    {
      key: "productionEnergy",
      ref: productionEnergyRef,
      label: "Production Energy",
      Comp: ProductionEnergy,
      saved: false,
      disabled: true, // disabled until productInfo is saved
      errorBannerText: "",
    },
    {
      key: "userEnergy",
      ref: userEnergyRef,
      label: "User Energy",
      Comp: UserEnergy,
      saved: false,
      disabled: true, // disabled until productInfo is saved
      errorBannerText: "",
    },
    {
      key: "transportation",
      ref: transportationRef,
      label: "Transportation",
      Comp: Transportation,
      saved: false,
      disabled: true, // disabled until productInfo is saved
      errorBannerText: "",
    },
  ]);

  const [activeTab, setActiveTab] = useState(0);

  const handleAddProduct = () => {
    if (tabConfig.every(tab => tab.saved)) {
      console.log("All sections saved — final submit");
    } else {
      setTabConfig(cfg =>
        cfg.map((t, i) =>
          i === activeTab
            ? { ...t, errorBannerText: "Please save all sections before adding a new product." }
            : t
        )
      );
    }
    router.push("/product-list");
  };

  const onTabSaved = async (tabKey: string) => {
    // Clear the error banner for the current tab
    setTabConfig(cfg => cfg.map((t, i) => (i == activeTab ? { ...t, errorBannerText: "" } : t)));

    // If it is the first tab, enable all tabs
    if (tabKey === "productInfo") {
      setTabConfig(config => config.map(tab => ({ ...tab, disabled: false })));
    }

    // set the tab to saved
    setTabConfig(cfg => cfg.map((t, i) => (t.key == tabKey ? { ...t, saved: true } : t)));

    return;
  };

  const onTabSaveError = async (errorBannerText: string) => {
    setTabConfig(cfg =>
      cfg.map((t, i) => (i == activeTab ? { ...t, errorBannerText: errorBannerText } : t))
    );
  };

  const onNext = async () => {
    let errorMessage: string = "Failed to save. Please try again.";
    // deligate to the tab component
    switch (tabConfig[activeTab].key) {
      case "productInfo":
        errorMessage =
          (await (mode == Mode.ADD
            ? productInfoRef.current?.saveTab()
            : productInfoRef.current?.updateTab())) ?? "Failed to save. Please try again.";
        break;
      case "billOfMaterials":
        errorMessage =
          (await (mode == Mode.ADD
            ? billOfMaterialsRef.current?.saveTab()
            : billOfMaterialsRef.current?.updateTab())) ?? "Failed to save. Please try again.";
        break;
      case "productionEnergy":
        errorMessage =
          (await (mode == Mode.ADD
            ? productionEnergyRef.current?.saveTab()
            : productionEnergyRef.current?.updateTab())) ?? "Failed to save. Please try again.";
        break;
      case "userEnergy":
        errorMessage =
          (await (mode == Mode.ADD
            ? userEnergyRef.current?.saveTab()
            : userEnergyRef.current?.updateTab())) ?? "Failed to save. Please try again.";
        break;
      case "transportation":
        errorMessage =
          (await (mode == Mode.ADD
            ? transportationRef.current?.saveTab()
            : transportationRef.current?.updateTab())) ?? "Failed to save. Please try again.";
        break;
    }

    if (!errorMessage) {
      // Record the tab as saved and move to the next tab
      onTabSaved(tabConfig[activeTab].key);
      setActiveTab(i => Math.min(i + 1, tabConfig.length - 1));
    } else {
      // If saving was unsuccessful, show an error banner
      onTabSaveError(errorMessage);
    }
  };

  return (
    <Suspense fallback={<div>Loading…</div>}>
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="overflow-visible">
          <TabGroup selectedIndex={activeTab} onChange={setActiveTab}>
            <TabList className="flex relative justify-between mb-10 px-6">
              {tabConfig.map((t, index) => (
                <div key={t.key} className="relative flex-1 flex justify-center">
                  <Tab
                    disabled={t.disabled}
                    className="flex flex-col items-center focus:outline-none group"
                  >
                    {({ selected }) => (
                      <>
                        <div
                          className={`z-10 w-8 h-8 rounded-full flex items-center justify-center mb-1 text-white text-sm font-medium ${
                            t.saved ? "bg-red-600" : "bg-gray-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div
                          className={`text-sm text-center ${
                            selected
                              ? "text-green-600 font-semibold"
                              : "text-gray-500 group-hover:text-gray-700"
                          }`}
                        >
                          {t.label}
                        </div>
                      </>
                    )}
                  </Tab>

                  {/* Connecting line */}
                  {index < tabConfig.length - 1 && (
                    <div className="absolute top-4 left-1/2 w-full">
                      <div className="h-0.5 bg-gray-400 w-full transform translate-x-4"></div>
                    </div>
                  )}
                </div>
              ))}
            </TabList>

            <TabPanels>
              {tabConfig.map(t => (
                <TabPanel key={t.key} unmount={false}>
                  <t.Comp
                    ref={t.ref}
                    productId={productId}
                    tabKey={t.key}
                    mode={mode}
                    setProductId={setProductId}
                    onFieldChange={() =>
                      setTabConfig(cfg =>
                        cfg.map((tab, i) => (i === activeTab ? { ...tab, saved: false } : tab))
                      )
                    }
                  />
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>

          {tabConfig[activeTab].errorBannerText && (
            <div className="mt-4 text-red-500">{tabConfig[activeTab].errorBannerText}</div>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <Button
              onClick={onNext}
              disabled={tabConfig[activeTab].saved}
              variant={tabConfig[activeTab].saved ? "outline" : "primary"}
            >
              {activeTab === tabConfig.length - 1 ? "Save" : "Save & Next"}
            </Button>
            <Button
              onClick={handleAddProduct}
              disabled={!tabConfig.every(tab => tab.saved)}
              variant={!tabConfig.every(tab => tab.saved) ? "outline" : "primary"}
            >
              {mode == Mode.ADD ? "Add Product" : "Update Product"}
            </Button>
          </div>
        </Card>
      </div>
    </Suspense>
  );
}
