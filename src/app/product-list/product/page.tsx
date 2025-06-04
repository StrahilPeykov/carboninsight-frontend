"use client";

import {
  useRef,
  useState,
  ForwardRefExoticComponent,
  RefAttributes,
  Suspense,
  useEffect,           /* already here */
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
import PopupModal from "@/app/components/ui/PopupModal";
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

  /* ---------- NEW REFS FOR AUTO-SCROLLING ---------- */
  const tabListRef = useRef<HTMLDivElement | null>(null);
  const tabButtonRefs = useRef<(HTMLElement | null)[]>([]);


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
      disabled: true,
      errorBannerText: "",
    },
    {
      key: "productionEnergy",
      ref: productionEnergyRef,
      label: "Production Energy",
      Comp: ProductionEnergy,
      saved: false,
      disabled: true,
      errorBannerText: "",
    },
    {
      key: "userEnergy",
      ref: userEnergyRef,
      label: "User Energy",
      Comp: UserEnergy,
      saved: false,
      disabled: true,
      errorBannerText: "",
    },
    {
      key: "transportation",
      ref: transportationRef,
      label: "Transportation",
      Comp: Transportation,
      saved: false,
      disabled: true,
      errorBannerText: "",
    },
  ]);

  const [activeTab, setActiveTab] = useState(0);
  const [productInfoSavedOnce, setProductInfoSavedOnce] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  /* --------- AUTO-CENTER ACTIVE STEP ON MOBILE --------- */
  useEffect(() => {
    const container = tabListRef.current;
    const activeBtn = tabButtonRefs.current[activeTab];
    if (!container || !activeBtn) return;
    if (container.scrollWidth <= container.clientWidth) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    const offset =
      btnRect.left -
      containerRect.left -
      container.clientWidth / 2 +
      btnRect.width / 2;

    container.scrollTo({
      left: container.scrollLeft + offset,
      behavior: "smooth",
    });
  }, [activeTab]);
  /* ----------------------------------------------------- */

  const handleAddProduct = () => {
    if (!tabConfig.every(tab => tab.saved)) {
      setTabConfig(cfg =>
        cfg.map((t, i) =>
          i === activeTab
        ? { ...t, errorBannerText: "Please save all sections before continuing." }
        : t
        )
      );
      return;
    }
    // all sections are saved → open the success modal
    setShowSuccessModal(true);
  };

  const onTabSaved = async (tabKey: string) => {
    setTabConfig(cfg => cfg.map((t, i) => (i == activeTab ? { ...t, errorBannerText: "" } : t)));
    // If it is the first tab, enable all tabs
    if (tabKey === "productInfo") {
      setTabConfig(config => config.map(tab => ({ ...tab, disabled: false })));
      setProductInfoSavedOnce(true);
    }

    setTabConfig(cfg => cfg.map((t, i) => (t.key == tabKey ? { ...t, saved: true } : t)));
    return;
  };

  const onTabSaveError = async (errorBannerText: string) => {
    setTabConfig(cfg =>
      cfg.map((t, i) => (i == activeTab ? { ...t, errorBannerText: errorBannerText } : t))
    );
  };

  const onSaveTab = async () => {
    let errorMessage: string = "Failed to save. Please try again.";
    // delegate to the tab component
    switch (tabConfig[activeTab].key) {
      case "productInfo":
        errorMessage =
          (await (mode == Mode.ADD && !productInfoSavedOnce
            ? productInfoRef.current?.saveTab()
            : productInfoRef.current?.updateTab())) ?? errorMessage;
        break;
      case "billOfMaterials":
        errorMessage =
          (await (mode == Mode.ADD
            ? billOfMaterialsRef.current?.saveTab()
            : billOfMaterialsRef.current?.updateTab())) ?? errorMessage;
        break;
      case "productionEnergy":
        errorMessage =
          (await (mode == Mode.ADD
            ? productionEnergyRef.current?.saveTab()
            : productionEnergyRef.current?.updateTab())) ?? errorMessage;
        break;
      case "userEnergy":
        errorMessage =
          (await (mode == Mode.ADD
            ? userEnergyRef.current?.saveTab()
            : userEnergyRef.current?.updateTab())) ?? errorMessage;
        break;
      case "transportation":
        errorMessage =
          (await (mode == Mode.ADD
            ? transportationRef.current?.saveTab()
            : transportationRef.current?.updateTab())) ?? errorMessage;
        break;
    }

    if (!errorMessage) {
      onTabSaved(tabConfig[activeTab].key);
    } else {
      onTabSaveError(errorMessage);
    }
  };

  const onNext = async () => {
    setActiveTab(i => Math.min(i + 1, tabConfig.length - 1));
  }

  const onBack = async () => {
    setActiveTab(i => Math.max(i - 1, 0));
  }

  return (
    <Suspense fallback={<div className="text-center py-10">Loading…</div>}>
      <div
        className="
          py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
          bg-white dark:bg-gray-900
          text-gray-900 dark:text-gray-100
        "
      >
        <Card
          className="
            overflow-visible
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            shadow-sm dark:shadow-none
          "
        >
          <TabGroup selectedIndex={activeTab} onChange={setActiveTab}>
            {/* Added overflow classes so the stepper scrolls on narrow screens */}
            <TabList
              ref={tabListRef}
              className="flex relative justify-between mb-10 px-6 overflow-x-auto sm:overflow-visible whitespace-nowrap"
            >
              {tabConfig.map((t, index) => (
                // Added min-width so each step has room inside the scroll container
                <div key={t.key} className="relative flex-1 flex justify-center min-w-[120px]">
                  <Tab
                    as="button" /* ensures ref element is HTMLButtonElement */
                    disabled={t.disabled}
                    className="flex flex-col items-center focus:outline-none group"
                    /* capture the button element for scrolling */
                    ref={(el) => {
                      tabButtonRefs.current[index] = el;
                    }}
                  >
                    {({ selected }) => (
                      <>
                        <div
                          className={`
                            z-10 w-8 h-8 rounded-full flex items-center justify-center mb-1
                            text-white text-sm font-medium
                            ${t.saved
                              ? "bg-red-600 dark:bg-red-500"
                              : "bg-gray-600 dark:bg-gray-500"}
                          `}
                        >
                          {index + 1}
                        </div>
                        <div
                          className={`
                            text-sm text-center
                            ${selected
                              ? "text-green-600 dark:text-green-300 font-semibold"
                              : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"}
                          `}
                        >
                          {t.label}
                        </div>
                      </>
                    )}
                  </Tab>

                  {index < tabConfig.length - 1 && (
                    <div className="absolute top-4 left-1/2 w-full">
                      <div className="h-0.5 bg-gray-400 dark:bg-gray-600 w-full transform translate-x-4" />
                    </div>
                  )}
                </div>
              ))}
            </TabList>

            <TabPanels>
              {tabConfig.map((t) => (
                <TabPanel key={t.key} unmount={false}>
                  <t.Comp
                    ref={t.ref}
                    productId={productId}
                    tabKey={t.key}
                    mode={mode}
                    setProductId={setProductId}
                    onFieldChange={() =>
                      setTabConfig((cfg) =>
                        cfg.map((tab, i) =>
                          i === activeTab ? { ...tab, saved: false } : tab
                        )
                      )
                    }
                  />
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>

          {tabConfig[activeTab].errorBannerText && (
            <div className="mt-4 text-red-500 dark:text-red-400">
              {tabConfig[activeTab].errorBannerText}
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <div className="flex flex-1">
              <Button
                onClick={onBack}
                disabled={activeTab === 0}
                variant={activeTab === 0 ? "outline" : "primary"}
                className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Back
              </Button>
            </div>

            <Button
              onClick={onSaveTab}
              disabled={tabConfig[activeTab].saved}
              variant={tabConfig[activeTab].saved ? "outline" : "primary"}
              className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Save
            </Button>

            <Button
              onClick={onNext}
              disabled={activeTab === tabConfig.length - 1 || (mode == Mode.ADD && !productInfoSavedOnce)}
              variant={activeTab === tabConfig.length - 1 || (mode == Mode.ADD && !productInfoSavedOnce) ? "outline" : "primary"}
              className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Next
            </Button>

            <Button
              onClick={handleAddProduct}
              disabled={false}
              variant={
                !tabConfig.every((tab) => tab.saved) ? "outline" : "primary"
              }
              className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Finish
            </Button>
          </div>

          {showSuccessModal && (
            <PopupModal
              title={mode === Mode.EDIT ? "Product updated successfully!" : "Product added successfully!"}
              confirmLabel="Ok"
              onConfirm={() => {
              setShowSuccessModal(false);
              router.push("/product-list");
              }}
              onClose={() => {
              setShowSuccessModal(false);
              router.push("/product-list");
              }}
              showCancel={false}
            >
              <p className="text-gray-800 dark:text-gray-200">
              {mode === Mode.EDIT
                ? "Your product has been updated."
                : "Your new product has been added."}
              </p>
            </PopupModal>
          )}
        </Card>
      </div>
    </Suspense>
  );
}
