"use client";

import { useRef, useState, RefAttributes, Suspense, useEffect } from "react";

import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/react";

import dynamic from "next/dynamic";

//
// dynamically load each tab so we avoid SSR issues
//
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

//
// API URL (env fallback)
//
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

/**
 * ProductClientPage is the main client-side page component for adding or editing a product.
 *
 * This component manages a multi-step tabbed form for product creation or editing, including:
 * - Product Information
 * - Bill of Materials
 * - Production Energy
 * - User Energy
 * - Transportation
 *
 * Features:
 * - Determines mode (add/edit) based on the presence of a `product_id` in the URL.
 * - Manages tab state, including saved/unsaved status, error banners, and enabling/disabling tabs.
 * - Handles auto-centering of the active tab on mobile devices for better UX.
 * - Delegates save/update logic to each tab via refs.
 * - Displays a success modal upon successful completion.
 * - Provides navigation between tabs and disables/enables actions based on form state.
 *
 * @component
 * @returns {JSX.Element} The rendered product add/edit page.
 */
export default function ProductClientPage() {
  // ── URL params / mode setup ────────────────────────────────────────────────
  const [productId, setProductId] = useState<string>("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("product_id") ?? "";
    setProductId(id);
    console.log("Product ID from URL:", id);
    setMode(id ? Mode.EDIT : Mode.ADD);
    setProductInfoSavedOnce(!!id);
  }, []);

  const [mode, setMode] = useState<Mode>(Mode.ADD);

  // ── if editing, mark all tabs saved on mount ───────────────────────────────
  useEffect(() => {
    if (mode === Mode.EDIT) {
      setTabConfig(cfg =>
        cfg.map(tab => ({ ...tab, saved: true, disabled: false, errorBannerText: "" }))
      );
    }
  }, [mode]);

  const router = useRouter();

  // ── tab refs for delegating save/update ────────────────────────────────────
  const productInfoRef = useRef<TabHandle | null>(null);
  const billOfMaterialsRef = useRef<TabHandle | null>(null);
  const productionEnergyRef = useRef<TabHandle | null>(null);
  const userEnergyRef = useRef<TabHandle | null>(null);
  const transportationRef = useRef<TabHandle | null>(null);

  // ── new refs for auto-scrolling the stepper on mobile ──────────────────────
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

  // ── initial tab configuration ────────────────────────────────────────────
  const [tabConfig, setTabConfig] = useState<TabConfigItem[]>([
    {
      key: "productInfo",
      ref: productInfoRef,
      label: "Product Information",
      Comp: ProductInfo,
      saved: false,
      disabled: false,
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
      btnRect.left - containerRect.left - container.clientWidth / 2 + btnRect.width / 2;

    container.scrollTo({
      left: container.scrollLeft + offset,
      behavior: "smooth",
    });
  }, [activeTab]);
  /* ----------------------------------------------------- */

  // ── finish handler: require first tab saved ───────────────────────────────
  const handleAddProduct = () => {
    if (!productInfoSavedOnce) {
      setTabConfig(cfg =>
        cfg.map((t, i) =>
          i === activeTab
            ? { ...t, errorBannerText: "Please save the Product Info tab before continuing" }
            : t
        )
      );
      return;
    }
    setShowSuccessModal(true);
  };

  // ── mark current tab as saved & clear errors ─────────────────────────────
  const onTabSaved = (tabKey: string) => {
    setTabConfig(cfg => cfg.map((t, i) => (i === activeTab ? { ...t, errorBannerText: "" } : t)));
    if (tabKey === "productInfo") {
      setTabConfig(cfg => cfg.map(tab => ({ ...tab, disabled: false })));
      setProductInfoSavedOnce(true);
    }
    setTabConfig(cfg => cfg.map(t => (t.key === tabKey ? { ...t, saved: true } : t)));
  };

  // ── show banner if saving current tab errors out ────────────────────────
  const onTabSaveError = (errorBannerText: string) => {
    setTabConfig(cfg => cfg.map((t, i) => (i === activeTab ? { ...t, errorBannerText } : t)));
  };

  // ── delegate save/update to active tab via refs ─────────────────────────
  const onSaveTab = async () => {
    let errorMessage: string = "Failed to save. Please try again.";
    switch (tabConfig[activeTab].key) {
      case "productInfo":
        errorMessage =
          (await (mode === Mode.ADD && !productInfoSavedOnce
            ? productInfoRef.current?.saveTab()
            : productInfoRef.current?.updateTab())) ?? errorMessage;
        break;
      case "billOfMaterials":
        errorMessage =
          (await (mode === Mode.ADD
            ? billOfMaterialsRef.current?.saveTab()
            : billOfMaterialsRef.current?.updateTab())) ?? errorMessage;
        break;
      case "productionEnergy":
        errorMessage =
          (await (mode === Mode.ADD
            ? productionEnergyRef.current?.saveTab()
            : productionEnergyRef.current?.updateTab())) ?? errorMessage;
        break;
      case "userEnergy":
        errorMessage =
          (await (mode === Mode.ADD
            ? userEnergyRef.current?.saveTab()
            : userEnergyRef.current?.updateTab())) ?? errorMessage;
        break;
      case "transportation":
        errorMessage =
          (await (mode === Mode.ADD
            ? transportationRef.current?.saveTab()
            : transportationRef.current?.updateTab())) ?? errorMessage;
        break;
    }

    if (errorMessage) {
      onTabSaveError(errorMessage);
    } else {
      onTabSaved(tabConfig[activeTab].key);
    }
  };

  // ── step navigation handlers ───────────────────────────────────────────
  const onNext = async () => {
    setActiveTab(i => Math.min(i + 1, tabConfig.length - 1));
  };

  const onBack = async () => {
    setActiveTab(i => Math.max(i - 1, 0));
  };

  // ── render ─────────────────────────────────────────────────────────
  return (
    <Suspense fallback={<div className="text-center py-10">Loading…</div>}>
      <div
        className="
          py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
          text-gray-900 dark:text-gray-100
        "
      >
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {mode === Mode.ADD ? "Add Product" : "Edit Product"}
          </h1>
        </div>

        <Card
          className="
            overflow-visible
            bg-gray-900 dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            shadow-sm dark:shadow-none
          "
        >

          {/* Stepper Tabs */}
          <TabGroup selectedIndex={activeTab} onChange={setActiveTab}>
            <TabList
              ref={tabListRef}
              className="flex relative justify-between mb-10 px-6 overflow-x-auto sm:overflow-visible whitespace-nowrap"
            >
              {tabConfig.map((t, index) => (
                <div key={t.key} className="relative flex-1 flex justify-center min-w-[120px]">
                  <Tab
                    as="button"
                    disabled={t.disabled}
                    className="flex flex-col items-center focus:outline-none group"
                    ref={el => {
                      tabButtonRefs.current[index] = el;
                    }}
                  >
                    {({ selected }) => (
                      <>
                        {/* step circle */}
                        <div
                          className={`
                            z-10 w-8 h-8 rounded-full flex items-center justify-center mb-1
                            text-white text-sm font-medium
                            ${
                              selected
                                ? "bg-red-600 dark:bg-red-500"
                                : "bg-gray-600 dark:bg-gray-500"
                            }`}
                        >
                          {index + 1}
                        </div>
                        {/* step label */}
                        <div
                          className={`
                            text-sm text-center
                            ${
                              selected
                                ? "text-red dark:text-red font-semibold"
                                : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                            }`}
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

          {/* Error Banner */}
          {tabConfig[activeTab].errorBannerText && (
            <div className="mt-4 text-red-500 dark:text-red-400">
              {tabConfig[activeTab].errorBannerText}
            </div>
          )}

          {/* Navigation Buttons */}
          <div
            className="
              flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6
            "
          >
            <div className="flex flex-1">
              <Button
                onClick={onBack}
                disabled={activeTab === 0}
                variant={activeTab === 0 ? "outline" : "primary"}
                className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 w-full sm:w-auto"
              >
                Back
              </Button>
            </div>

            {activeTab === 0 && (
              <Button
                onClick={onSaveTab}
                disabled={tabConfig[activeTab].saved}
                variant={tabConfig[activeTab].saved ? "outline" : "primary"}
                className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 w-full sm:w-auto"
              >
                Save
              </Button>
            )}

            <Button
              onClick={onNext}
              disabled={
                activeTab === tabConfig.length - 1 || (mode === Mode.ADD && !productInfoSavedOnce)
              }
              variant={
                activeTab === tabConfig.length - 1 || (mode === Mode.ADD && !productInfoSavedOnce)
                  ? "outline"
                  : "primary"
              }
              className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 w-full sm:w-auto"
            >
              Next
            </Button>

            <Button
              onClick={handleAddProduct}
              disabled={false}
              variant={!productInfoSavedOnce ? "outline" : "primary"}
              className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 w-full sm:w-auto"
            >
              Finish
            </Button>
          </div>

          {/* Success Modal */}
          {showSuccessModal && (
            <PopupModal
              title={
                mode === Mode.EDIT ? "Product updated successfully!" : "Product added successfully!"
              }
              confirmLabel="Ok"
              showCancel={false}
              onConfirm={() => {
                setShowSuccessModal(false);
                router.push("/product-list");
              }}
              onClose={() => {
                setShowSuccessModal(false);
                router.push("/product-list");
              }}
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
