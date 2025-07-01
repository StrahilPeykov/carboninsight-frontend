"use client";

import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import ImportExportDropdown from "@/app/components/ui/ImportExportDropdown";
import { DataPassedToTabs, TabHandle } from "../../page";
import { TransportEmission } from "@/lib/api/transportEmissionApi";
import { LineItem } from "@/lib/api/bomApi";
import { EmissionReference } from "@/lib/api/emissionReferenceApi";
import Button from "@/app/components/ui/Button";
import { Plus, X, AlertCircle, ChevronDown } from "lucide-react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { OurTable } from "@/app/components/ui/OurTable";
import * as apiCalls from "./api-calls";
import * as Helpers from "./helpers";
import { FormData, getTransportColumns } from "./types";
import { LifecycleStageChoice } from "@/lib/api";
import OverrideModal from "../components/OverrideModal";
import { FormDataWithOverrideFactors } from "../components/OverrideModal";

const Index = forwardRef<TabHandle, DataPassedToTabs>(
  ({ productId: productIdString, onFieldChange }, ref) => {
    // State
    const [emissions, setEmissions] = useState<TransportEmission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentEmission, setCurrentEmission] = useState<TransportEmission | null>(null);
    const [deletingEmissionId, setDeletingEmissionId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<FormData>({
      distance: "",
      weight: "",
      reference: "",
      override_factors: [],
      line_items: [],
    });
    const [references, setReferences] = useState<EmissionReference[]>([]);
    const [referenceQuery, setReferenceQuery] = useState("");
    const [bomLineItems, setBomLineItems] = useState<LineItem[]>([]);
    const [bomLineItemQuery, setBomLineItemQuery] = useState("");
    const [lifecycleChoices, setLifecycleChoices] = useState<LifecycleStageChoice[]>([]);
    const [showOverridesForEmission, setShowOverridesForEmission] =
      useState<TransportEmission | null>(null);
    const [showBomItemsForEmission, setShowBomItemsForEmission] =
      useState<TransportEmission | null>(null);
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    // Parse productId
    const productId = () => {
      const id = parseInt(productIdString || "", 10);
      // if (isNaN(id)) {
      //   throw new Error("productId is not a number");
      // }
      return id;
    };

    // Company primary key from localStorage
    const companyPkString = localStorage.getItem("selected_company_id");
    if (!companyPkString) {
      console.error("company_pk is null");
      return null;
    }
    const company_pk = parseInt(companyPkString, 10);

    useImperativeHandle(ref, () => ({
      saveTab: async (): Promise<string> => {
        return "";
      },
      updateTab: async (): Promise<string> => {
        return "";
      },
    }));

    // Fetch initial data whenever productId changes
    useEffect(() => {
      if (productIdString) {
        apiCalls.fetchEmissions(setIsLoading, company_pk, productId, setEmissions);
        apiCalls.fetchBomLineItems(company_pk, productId, setBomLineItems);
        apiCalls.fetchLifecycleChoices(company_pk, productId, setLifecycleChoices);
        apiCalls.fetchReferences(setReferences);
      }
    }, [productIdString]);

    // Define columns of table.
    const columns = getTransportColumns(
      references,
      setShowOverridesForEmission,
      setShowBomItemsForEmission,
      setCurrentEmission,
      setFormData,
      company_pk,
      productId,
      setBomLineItems,
      setLifecycleChoices,
      setReferences,
      setIsModalOpen,
      setDeletingEmissionId,
      setIsDeleteModalOpen
    );

    return (
      <>
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Transportation Emissions</h2>
          <p className="mb-4">Add or manage transportation emissions.</p>
        </div>

        {/* Emission List */}
        {isLoading ? (
          <div className="text-center py-6">Data loading...</div>
        ) : emissions.length === 0 ? (
          <div className="text-center py-6">No transport emissions yet.</div>
        ) : (
          <OurTable
            caption="A table displaying the transport emissions of this product."
            cardTitle="Emission #"
            items={emissions}
            columns={columns}
          />
        )}

        {/* Add Emission Button */}
        <div className="mt-6">
          <Button
            onClick={() =>
              Helpers.handleOpenModal(
                setCurrentEmission,
                setFormData,
                company_pk,
                productId,
                setBomLineItems,
                setLifecycleChoices,
                setReferences,
                setIsModalOpen
              )
            }
            className="flex items-center gap-2"
            variant="primary"
          >
            <Plus className="w-4 h-4" /> Add Transport Emission
          </Button>
          <ImportExportDropdown
            companyId={company_pk}
            productId={productId()}
            section="transport"
            onImportComplete={() =>
              apiCalls.fetchEmissions(setIsLoading, company_pk, productId, setEmissions)
            }
            showTemplateModal={showTemplateModal}
            setShowTemplateModal={setShowTemplateModal}
          />
        </div>
        {showTemplateModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Template File Blocked
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Template files cannot be uploaded. Please provide a valid data file instead.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="bg-red text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Emission Modal */}
        <Dialog
          open={isModalOpen}
          as="div"
          className="fixed inset-0 overflow-y-auto pt-12 z-20"
          onClose={() => Helpers.handleCloseModal(setIsModalOpen, setCurrentEmission)}
        >
          <div className="min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-black/50" />
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <DialogPanel className="relative inline-block w-full max-w-lg p-6 my-8 overflow-visible text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
              <div className="flex justify-between items-center mb-4">
                <DialogTitle
                  as="h3"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {currentEmission ? "Edit Transport Emission" : "Add Transport Emission"}
                </DialogTitle>
                <button
                  onClick={() => Helpers.handleCloseModal(setIsModalOpen, setCurrentEmission)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Distance Field */}
                <div>
                  <label
                    htmlFor="distance"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Distance (km) *
                  </label>
                  <input
                    type="number"
                    id="distance"
                    min="0"
                    step="0.01"
                    value={formData.distance ?? ""}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        distance: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                {/* Weight Field */}
                <div>
                  <label
                    htmlFor="weight"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Weight (tonnes) *
                  </label>
                  <input
                    type="number"
                    id="weight"
                    min="0"
                    step="0.01"
                    value={formData.weight ?? ""}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        weight: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                {/* Reference Combobox */}
                <div>
                  <label
                    htmlFor="reference"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Reference Emission Factor *
                  </label>
                  <div className="relative">
                    <Combobox
                      value={
                        formData.reference
                          ? references.find(ref => ref.id.toString() === formData.reference)
                              ?.name || ""
                          : ""
                      }
                      onChange={(value: string | null) => {
                        if (!value) {
                          setFormData({
                            ...formData,
                            reference: "",
                          });
                          return;
                        }
                        const selected = references.find(ref => ref.name === value);
                        setFormData({
                          ...formData,
                          reference: selected ? selected.id.toString() : "",
                        });
                      }}
                    >
                      <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-left">
                        <ComboboxInput
                          className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white focus:ring-0 bg-white dark:bg-gray-700"
                          displayValue={(val: string) => val}
                          onChange={e => setReferenceQuery(e.target.value)}
                          placeholder="Select a reference"
                        />
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </ComboboxButton>
                      </div>
                      <div className="relative w-full">
                        <ComboboxOptions className="absolute z-[200] max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {references
                            .filter(
                              ref =>
                                referenceQuery === "" ||
                                ref.name.toLowerCase().includes(referenceQuery.toLowerCase())
                            )
                            .map(ref => (
                              <ComboboxOption
                                key={ref.id}
                                value={ref.name}
                                className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-white data-focus:bg-red-100 dark:data-focus:bg-red data-hover:bg-gray-100 dark:data-hover:bg-gray-600"
                              >
                                {ref.name}
                              </ComboboxOption>
                            ))}
                        </ComboboxOptions>
                      </div>
                    </Combobox>
                  </div>
                </div>

                {/* BOM Line Items Combobox */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Associated BOM Items
                  </label>
                  {formData.line_items.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.line_items.map(itemId => {
                        const item = bomLineItems.find(i => i.id === itemId);
                        return (
                          <div
                            key={itemId}
                            className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                          >
                            <span>{item ? item.line_item_product.name : `Item #${itemId}`}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  line_items: formData.line_items.filter(id => id !== itemId),
                                });
                              }}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="relative">
                    <Combobox
                      value=""
                      onChange={(value: any) => {
                        if (value && !formData.line_items.includes(value)) {
                          setFormData({
                            ...formData,
                            line_items: [...formData.line_items, value],
                          });
                        }
                      }}
                    >
                      <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-left">
                        <ComboboxInput
                          className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white focus:ring-0 bg-white dark:bg-gray-700"
                          displayValue={() => bomLineItemQuery}
                          onChange={e => setBomLineItemQuery(e.target.value)}
                          placeholder="Select BOM items to associate"
                        />
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </ComboboxButton>
                      </div>
                      <div className="relative w-full">
                        <ComboboxOptions className="absolute z-[200] max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {bomLineItems.length === 0 ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                              No BOM items available. Add items in the Bill of Materials tab first.
                            </div>
                          ) : bomLineItems.filter(
                              item =>
                                !formData.line_items.includes(item.id) &&
                                (bomLineItemQuery === "" ||
                                  item.line_item_product.name
                                    .toLowerCase()
                                    .includes(bomLineItemQuery.toLowerCase()))
                            ).length === 0 ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                              {bomLineItemQuery === ""
                                ? "All BOM items already selected."
                                : "No matching items found."}
                            </div>
                          ) : (
                            bomLineItems
                              .filter(
                                item =>
                                  !formData.line_items.includes(item.id) &&
                                  (bomLineItemQuery === "" ||
                                    item.line_item_product.name
                                      .toLowerCase()
                                      .includes(bomLineItemQuery.toLowerCase()))
                              )
                              .map(item => (
                                <ComboboxOption
                                  key={item.id}
                                  value={item.id}
                                  className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-white data-focus:bg-red-100 dark:data-focus:bg-red data-hover:bg-gray-100 dark:data-hover:bg-gray-600"
                                >
                                  {item.line_item_product.name}
                                </ComboboxOption>
                              ))
                          )}
                        </ComboboxOptions>
                      </div>
                    </Combobox>
                  </div>
                </div>

                {/* Override Factors Section */}
                <OverrideModal
                  formData={formData}
                  setFormData={setFormData as (a: FormDataWithOverrideFactors) => void}
                  //setFormData={Helpers.setFormDataWrapper(setFormData)}
                  lifecycleChoices={lifecycleChoices}
                  onFieldChange={onFieldChange}
                  renderField={(fieldKey: string) => <></>}
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t dark:border-t-gray-700">
                <Button
                  onClick={() => Helpers.handleCloseModal(setIsModalOpen, setCurrentEmission)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    apiCalls.handleSubmit(
                      formData,
                      setIsSubmitting,
                      currentEmission,
                      company_pk,
                      productId,
                      setIsLoading,
                      setEmissions,
                      setIsModalOpen,
                      onFieldChange
                    )
                  }
                  variant="primary"
                  disabled={isSubmitting || Helpers.formIncomplete(formData)}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <Dialog
            open={isDeleteModalOpen}
            as="div"
            className="fixed inset-0 z-20 overflow-y-auto"
            onClose={() => setIsDeleteModalOpen(false)}
          >
            <div className="min-h-screen px-4 text-center">
              <div className="fixed inset-0 bg-black/50" />
              <span className="inline-block h-screen align-middle" aria-hidden="true">
                &#8203;
              </span>
              <DialogPanel className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
                <DialogTitle className="flex items-center gap-3 mb-4 text-red">
                  <AlertCircle className="w-6 h-6" />
                  <span className="text-lg font-semibold">Confirm Deletion</span>
                </DialogTitle>
                <p className="mb-6">
                  Are you sure you want to delete this transport emission? This action cannot be
                  undone.
                </p>
                <div className="flex justify-end gap-2">
                  <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline">
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      apiCalls.handleDelete(
                        deletingEmissionId,
                        company_pk,
                        productId,
                        setEmissions,
                        emissions,
                        setIsDeleteModalOpen,
                        onFieldChange
                      )
                    }
                    variant="primary"
                    className="bg-red hover:bg-red-800 text-white"
                  >
                    Delete
                  </Button>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        )}

        {/* Overrides Modal */}
        <Dialog
          open={!!showOverridesForEmission}
          as="div"
          className="fixed inset-0 z-20 overflow-y-auto"
          onClose={() => setShowOverridesForEmission(null)}
        >
          <div className="min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-black/50" />
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <DialogPanel className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
              <DialogTitle
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
              >
                Override Factors
              </DialogTitle>
              <div className="mt-4">
                {showOverridesForEmission?.override_factors &&
                showOverridesForEmission.override_factors.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Lifecycle Stage
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Biogenic CO₂
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Non-Biogenic CO₂
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {showOverridesForEmission.override_factors.map((factor, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {lifecycleChoices.find(c => c.value === factor.lifecycle_stage)
                              ?.display_name ?? factor.lifecycle_stage}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {factor.co_2_emission_factor_biogenic}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {factor.co_2_emission_factor_non_biogenic}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 dark:text-gray-300">No overrides found.</p>
                )}
              </div>
              <div className="mt-6">
                <Button
                  onClick={() => setShowOverridesForEmission(null)}
                  variant="primary"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* BOM Items Modal */}
        <Dialog
          open={!!showBomItemsForEmission}
          as="div"
          className="fixed inset-0 z-20 overflow-y-auto"
          onClose={() => setShowBomItemsForEmission(null)}
        >
          <div className="min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-black/50" />
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <DialogPanel className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
              <DialogTitle
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
              >
                Associated BOM Items
              </DialogTitle>
              <div className="mt-4">
                {showBomItemsForEmission?.line_items && bomLineItems.length > 0 ? (
                  <div className="overflow-y-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Product Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Quantity
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {showBomItemsForEmission.line_items.map(itemId => {
                          const item = bomLineItems.find(i => i.id === itemId);
                          return (
                            <tr key={itemId}>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                {itemId}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                {item ? item.line_item_product.name : "Unknown Item"}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                {item ? item.quantity : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-300">No BOM items found.</p>
                )}
              </div>
              <div className="mt-6">
                <Button
                  onClick={() => setShowBomItemsForEmission(null)}
                  variant="primary"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      </>
    );
  }
);

Index.displayName = "Transportation";
export default Index;
