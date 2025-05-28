"use client";

import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { DataPassedToTabs, TabHandle } from "../page";
import {
  productionEnergyApi,
  ProductionEnergyEmission,
  EmissionOverrideFactor,
} from "@/lib/api/productionEmissionApi";
import { EmissionReference, emissionReferenceApi } from "@/lib/api/emissionReferenceApi";
import { bomApi, LineItem } from "@/lib/api/bomApi";
import Button from "@/app/components/ui/Button";
import { Plus, Trash, Edit, X, AlertCircle, ChevronDown } from "lucide-react";
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

const ProductionEnergy = forwardRef<TabHandle, DataPassedToTabs>(
  ({ productId: productIdString, onFieldChange }, ref) => {
    const [emissions, setEmissions] = useState<ProductionEnergyEmission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentEmission, setCurrentEmission] = useState<ProductionEnergyEmission | null>(null);
    const [formData, setFormData] = useState<{
      energy_consumption: string;
      reference: string;
      override_factors: EmissionOverrideFactor[];
      line_items: number[];
    }>({
      energy_consumption: "",
      reference: "",
      override_factors: [],
      line_items: [],
    });
    const [deletingEmissionId, setDeletingEmissionId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [references, setReferences] = useState<EmissionReference[]>([]);
    const [referenceQuery, setReferenceQuery] = useState("");
    const [query, setQuery] = useState("");
    const [showFactorsForEmission, setShowFactorsForEmission] =
      useState<ProductionEnergyEmission | null>(null);
    const [bomLineItems, setBomLineItems] = useState<LineItem[]>([]);
    const [bomLineItemQuery, setBomLineItemQuery] = useState("");
    const [showBomItemsForEmission, setShowBomItemsForEmission] =
      useState<ProductionEnergyEmission | null>(null);

    const company_pk_string = localStorage.getItem("selected_company_id");
    if (!company_pk_string) {
      console.error("company_pk is null");
      return null;
    }
    const company_pk = parseInt(company_pk_string, 10);

    const productId = () => {
      const id = parseInt(productIdString, 10);
      if (isNaN(id)) {
        throw new Error("productId is not a number");
      }
      return id;
    };

    useImperativeHandle(ref, () => ({
      saveTab,
      updateTab,
    }));

    // Save tab function which is called from the parent
    const saveTab = async (): Promise<string> => {
      return "";
    };

    //  Update tab function which is called from the parent in edit mode
    const updateTab = async (): Promise<string> => {
      return "";
    };

    // Fetch emissions when the component mounts
    useEffect(() => {
      if (productIdString) {
        fetchEmissions();
        fetchBomLineItems();
      }
    }, [productIdString]);

    const fetchEmissions = async () => {
      setIsLoading(true);
      try {
        const data = await productionEnergyApi.getAllProductionEmissions(company_pk, productId());
        setEmissions(data);
      } catch (error) {
        console.error("Error fetching emissions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleOpenModal = (emission: ProductionEnergyEmission | null = null) => {
      if (emission) {
        setCurrentEmission(emission);
        setFormData({
          energy_consumption: emission.energy_consumption.toString(),
          reference: emission.reference?.toString() || "",
          override_factors: emission.override_factors || [],
          line_items: emission.line_items || [],
        });
      } else {
        setCurrentEmission(null);
        setFormData({
          energy_consumption: "",
          reference: "",
          override_factors: [],
          line_items: [],
        });
      }
      fetchBomLineItems();
      setIsModalOpen(true);
    };

    const handleCloseModal = () => {
      setIsModalOpen(false);
      setCurrentEmission(null);
    };

    const handleSubmit = async () => {
      const energyConsumption = parseFloat(formData.energy_consumption);
      if (isNaN(energyConsumption) || energyConsumption < 1) {
        alert("Please enter a valid energy consumption value (must be 1 or greater)");
        return;
      }
      if (
        formData.override_factors.some(
          factor => factor.lifecycle_stage === "" || isNaN(factor.co_2_emission_factor)
        )
      ) {
        alert("Please fill in all override factor fields correctly.");
        return;
      }

      setIsSubmitting(true);
      try {
        const reference = formData.reference ? parseInt(formData.reference) : null;

        const data = {
          energy_consumption: energyConsumption,
          reference,
          override_factors:
            formData.override_factors.length > 0 ? formData.override_factors : undefined,
          line_items: formData.line_items.length > 0 ? formData.line_items : undefined,
        };

        if (currentEmission) {
          // Update existing emission
          await productionEnergyApi.updateProductionEmission(
            company_pk,
            productId(),
            currentEmission.id,
            data
          );
        } else {
          // Create new emission
          await productionEnergyApi.createProductionEmission(company_pk, productId(), data);
        }

        // Refresh the list of emissions
        await fetchEmissions();
        setIsModalOpen(false);
        onFieldChange(); // Notify parent component of changes
      } catch (error) {
        console.error("Error saving emission:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleConfirmDelete = (emissionId: number) => {
      setDeletingEmissionId(emissionId);
      setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
      if (deletingEmissionId === null) return;

      try {
        await productionEnergyApi.deleteProductionEmission(
          company_pk,
          productId(),
          deletingEmissionId
        );
        setEmissions(emissions.filter(emission => emission.id !== deletingEmissionId));
        setIsDeleteModalOpen(false);
        setDeletingEmissionId(null);
        onFieldChange(); // Notify parent component of changes
      } catch (error) {
        console.error("Error deleting emission:", error);
      }
    };

    // Add an override factor field
    const handleAddOverrideFactor = () => {
      setFormData({
        ...formData,
        override_factors: [
          ...formData.override_factors,
          { lifecycle_stage: "", co_2_emission_factor: 1 },
        ],
      });
    };

    // Update an override factor
    const handleOverrideFactorChange = (index: number, field: "name" | "value", value: string) => {
      const updatedFactors = [...formData.override_factors];
      if (field === "name") {
        updatedFactors[index].lifecycle_stage = value;
      } else {
        updatedFactors[index].co_2_emission_factor = parseFloat(value);
      }

      setFormData({
        ...formData,
        override_factors: updatedFactors,
      });
    };

    // Remove an override factor
    const handleRemoveOverrideFactor = (index: number) => {
      const updatedFactors = [...formData.override_factors];
      updatedFactors.splice(index, 1);
      setFormData({
        ...formData,
        override_factors: updatedFactors,
      });
    };

    const fetchBomLineItems = async () => {
      try {
        const data = await bomApi.getAllLineItems(company_pk, productId());
        setBomLineItems(data);
      } catch (error) {
        console.error("Error fetching BOM items:", error);
      }
    };

    const lifecycleOptions = [
      "A1 - Raw material supply (and upstream production)",
      "A2 - Cradle-to-gate transport to factory",
      "A3 - A3 - Production",
      "A4 - Transport to final destination",
      "A5 - Installation",
      "A1-A3 - Raw material supply and production",
      "A4-A5 - Transport to final destination and installation",
      "B1 - Usage phase",
      "B2 - Maintenance",
      "B3 - Repair",
      "B4 - Replacement",
      "B5 - Update/upgrade, refurbishing",
      "B6 - Operational energy use",
      "B7 - Operational water use",
      "B1-B7 - Entire usage phase",
      "C1 - Reassembly",
      "C2 - Transport to recycler",
      "C3 - Recycling, waste treatment",
      "C4 - Landfill",
      "C1-C4 - Decommissioning",
      "C2-C4 - Transport to recycler and landfill",
      "D - Reuse",
      "Other",
    ];

    const getLifecycleEnumValue = (displayString: string | null): string => {
      if (!displayString) return "";
      return displayString.split(" - ")[0];
    };

    useEffect(() => {
      const fetchReferences = async () => {
        try {
          const data = await emissionReferenceApi.getAllProductionEnergyReferences();
          setReferences(data);
        } catch (error) {
          console.error("Error fetching references:", error);
        }
      };

      fetchReferences();
    }, []);

    return (
      <>
        <div>
          <h2 className="text-xl font-semibold mb-4">Production Energy</h2>
          <p className="mb-4">Track energy consumption during manufacturing process.</p>
        </div>

        {/* Emissions list - mobile view */}
        <div className="md:hidden">
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : emissions.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No production energy emissions added yet.
            </div>
          ) : (
            emissions.map(emission => (
              <div key={emission.id} className="border rounded-lg p-4 mb-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Emission #{emission.id}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenModal(emission)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                    >
                      <Edit className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleConfirmDelete(emission.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                    >
                      <Trash className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Energy Consumption:</div>
                  <div>{emission.energy_consumption} kWh</div>
                  {emission.reference && (
                    <>
                      <div className="text-gray-500">Reference:</div>
                      <div>
                        {references.find(ref => ref.id === emission.reference)?.name ||
                          emission.reference}
                      </div>
                    </>
                  )}
                  {emission.override_factors && emission.override_factors.length > 0 && (
                    <>
                      <div className="text-gray-500">Override Factors:</div>
                      <div>
                        <button
                          onClick={() => setShowFactorsForEmission(emission)}
                          className="underline"
                        >
                          View factors ({emission.override_factors.length})
                        </button>
                      </div>
                    </>
                  )}
                  {emission.line_items && emission.line_items.length > 0 && (
                    <>
                      <div className="text-gray-500">BOM Items:</div>
                      <div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setShowBomItemsForEmission(emission);
                          }}
                          className="underline"
                        >
                          View items ({emission.line_items.length})
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Emissions list - desktop view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">ID</th>
                <th className="p-2">Reference</th>
                <th className="p-2">Energy Consumption (kWh)</th>
                <th className="p-2">Override Factors</th>
                <th className="p-2">BOM Items</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : emissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-4">
                    No production energy emissions added yet.
                  </td>
                </tr>
              ) : (
                emissions.map(emission => (
                  <tr
                    key={emission.id}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="p-2">{emission.id}</td>
                    <td className="p-2">
                      {emission.reference
                        ? references.find(ref => ref.id === emission.reference)?.name ||
                          emission.reference
                        : "—"}
                    </td>
                    <td className="p-2">{emission.energy_consumption}</td>
                    <td className="p-2">
                      {emission.override_factors && emission.override_factors.length > 0 ? (
                        <button
                          onClick={() => setShowFactorsForEmission(emission)}
                          className="underline hover:underline text-sm flex items-center"
                        >
                          View factor{emission.override_factors.length !== 1 ? "s" : ""} (
                          {emission.override_factors.length})
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-2">
                      {emission.line_items && emission.line_items.length > 0 ? (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setShowBomItemsForEmission(emission);
                          }}
                          className="underline"
                        >
                          View item{emission.line_items.length !== 1 ? "s" : ""} (
                          {emission.line_items.length})
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenModal(emission)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                          aria-label="Edit emission"
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleConfirmDelete(emission.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                          aria-label="Delete emission"
                        >
                          <Trash className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add the Emission button */}
        <div className="mt-6">
          <Button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2"
            variant="primary"
          >
            <Plus className="w-4 h-4" /> Add Production Energy
          </Button>
        </div>

        {/* Add/Edit Emission Modal */}
        <Dialog
          open={isModalOpen}
          as="div"
          className="fixed inset-0 z-20 overflow-y-auto"
          onClose={handleCloseModal}
        >
          <div className="min-h-screen px-4 text-center">
            {/* Static backdrop */}
            <div className="fixed inset-0 bg-black/50" />

            {/* This element centers the modal contents */}
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>

            <DialogPanel className="relative inline-block w-full max-w-lg p-6 my-8 overflow-visible text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
              <div className="flex justify-between items-center mb-4">
                <DialogTitle
                  as="h3"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {currentEmission ? "Edit" : "Add"} Production Energy
                </DialogTitle>
                <button
                  onClick={handleCloseModal}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Energy Consumption Section */}
                <div>
                  <label
                    htmlFor="energy_consumption"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Energy Consumption (kWh) *
                  </label>
                  <input
                    type="number"
                    id="energy_consumption"
                    min="0"
                    step="0.01"
                    value={formData.energy_consumption}
                    onChange={e => setFormData({ ...formData, energy_consumption: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                {/* Reference Section */}
                <div>
                  <label
                    htmlFor="reference"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Reference
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
                          setFormData({ ...formData, reference: "" });
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
                          displayValue={(value: string) => value}
                          onChange={event => setReferenceQuery(event.target.value)}
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
                                className="relative cursor-default select-none w-full py-2 pl-3 pr-9 text-gray-900 dark:text-white data-focus:bg-red-100 dark:data-focus:bg-red data-hover:bg-gray-100 dark:data-hover:bg-gray-600"
                              >
                                {ref.name}
                              </ComboboxOption>
                            ))}
                        </ComboboxOptions>
                      </div>
                    </Combobox>
                  </div>
                </div>

                {/* BOM Line Items Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Associated Bill of Materials Items
                  </label>

                  {/* Display selected BOM items as tags */}
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

                  {/* BOM Items combobox */}
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
                          onChange={event => setBomLineItemQuery(event.target.value)}
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
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Override Factors
                    </label>
                    <button
                      type="button"
                      onClick={handleAddOverrideFactor}
                      className="text-sm text-red hover:text-red-800"
                    >
                      + Add Factor
                    </button>
                  </div>

                  {formData.override_factors.map((factor, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <div className="relative flex-1">
                        <Combobox
                          value={
                            factor.lifecycle_stage
                              ? lifecycleOptions.find(opt =>
                                  opt.startsWith(factor.lifecycle_stage)
                                ) || ""
                              : ""
                          }
                          onChange={value => {
                            const enumValue = getLifecycleEnumValue(value);
                            handleOverrideFactorChange(index, "name", enumValue);
                          }}
                        >
                          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-left">
                            <ComboboxInput
                              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white focus:ring-0 bg-white dark:bg-gray-700"
                              displayValue={(value: string | null) => value || ""}
                              onChange={event => setQuery(event.target.value)}
                              placeholder="Select lifecycle stage"
                            />
                            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                              <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </ComboboxButton>
                          </div>
                          <div className="relative w-full">
                            <ComboboxOptions className="absolute z-[200] max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {lifecycleOptions.filter(
                                option =>
                                  query === "" || option.toLowerCase().includes(query.toLowerCase())
                              ).length === 0 ? (
                                <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                                  No matching lifecycle stages found.
                                </div>
                              ) : (
                                lifecycleOptions
                                  .filter(
                                    option =>
                                      query === "" ||
                                      option.toLowerCase().includes(query.toLowerCase())
                                  )
                                  .map((option, i) => (
                                    <ComboboxOption
                                      key={i}
                                      value={option}
                                      className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-white data-focus:bg-red-100 dark:data-focus:bg-red data-hover:bg-gray-100 dark:data-hover:bg-gray-600"
                                    >
                                      {option}
                                    </ComboboxOption>
                                  ))
                              )}
                            </ComboboxOptions>
                          </div>
                        </Combobox>
                      </div>
                      <input
                        type="number"
                        placeholder="Value"
                        value={factor.co_2_emission_factor}
                        onChange={e => handleOverrideFactorChange(index, "value", e.target.value)}
                        min={1}
                        className="w-24 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOverrideFactor(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t dark:border-t-gray-700">
                <Button onClick={handleCloseModal} variant="outline">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="primary"
                  disabled={isSubmitting || !formData.energy_consumption}
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
              {/* Static backdrop */}
              <div className="fixed inset-0 bg-black/50" />

              {/* This element centers the modal contents */}
              <span className="inline-block h-screen align-middle" aria-hidden="true">
                &#8203;
              </span>

              <DialogPanel className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
                <DialogTitle as="h3" className="flex items-center gap-3 mb-4 text-red">
                  <AlertCircle className="w-6 h-6" />
                  <span className="text-lg font-semibold">Confirm Deletion</span>
                </DialogTitle>

                <p className="mb-6">
                  Are you sure you want to delete this production energy emission? This action
                  cannot be undone.
                </p>

                <div className="flex justify-end gap-2">
                  <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
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

        {/* Override Factors Modal */}
        <Dialog
          open={!!showFactorsForEmission}
          as="div"
          className="fixed inset-0 z-20 overflow-y-auto"
          onClose={() => setShowFactorsForEmission(null)}
        >
          <div className="min-h-screen px-4 text-center">
            {/* Static backdrop */}
            <div className="fixed inset-0 bg-black/50" />

            {/* This element centers the modal contents */}
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
                {showFactorsForEmission?.override_factors &&
                showFactorsForEmission.override_factors.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Lifecycle Stage
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          CO₂ Emission Factor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {showFactorsForEmission.override_factors.map((factor, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {lifecycleOptions.find(opt => opt.startsWith(factor.lifecycle_stage)) ||
                              factor.lifecycle_stage}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {factor.co_2_emission_factor}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 dark:text-gray-300">No override factors found.</p>
                )}
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => setShowFactorsForEmission(null)}
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
                              <td className="px-4 py-2">{itemId}</td>
                              <td className="px-4 py-2">
                                {item ? item.line_item_product.name : "Unknown Item"}
                              </td>
                              <td className="px-4 py-2">{item ? item.quantity : "-"}</td>
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

ProductionEnergy.displayName = "ProductionEnergy";
export default ProductionEnergy;
