"use client";

import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import { DataPassedToTabs, TabHandle } from "../page";
import {
  transportEmissionApi,
  TransportEmission,
  CreateTransportEmission,
} from "@/lib/api/transportEmissionApi";
import { bomApi, LineItem } from "@/lib/api/bomApi";
import { emissionReferenceApi, EmissionReference } from "@/lib/api/emissionReferenceApi";
import { LifecycleStage, lifecycleStages, OverrideFactor } from "@/lib/api";
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
import { useRouter } from "next/navigation";

const Transportation = forwardRef<TabHandle, DataPassedToTabs>(
  ({ productId: productIdString, onFieldChange }, ref) => {
    // Parse productId
    const productId = () => {
      const id = parseInt(productIdString || "", 10);
      if (isNaN(id)) {
        throw new Error("productId is not a number");
      }
      return id;
    };

    // Company primary key from localStorage
    const companyPkString = localStorage.getItem("selected_company_id");
    if (!companyPkString) {
      console.error("company_pk is null");
      return null;
    }
    const company_pk = parseInt(companyPkString, 10);
    const router = useRouter();

    // State
    const [emissions, setEmissions] = useState<TransportEmission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentEmission, setCurrentEmission] = useState<TransportEmission | null>(null);
    const [deletingEmissionId, setDeletingEmissionId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<{
      distance: string;
      weight: string;
      reference: string;
      override_factors: OverrideFactor[];
      line_items: number[];
    }>({
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

    const [lifecycleChoices, setLifecycleChoices] = useState<{
      value: string;
      display_name: string;
    }[]>([]);

    const [showOverridesForEmission, setShowOverridesForEmission] =
      useState<TransportEmission | null>(null);
    const [showBomItemsForEmission, setShowBomItemsForEmission] =
      useState<TransportEmission | null>(null);

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
        fetchEmissions();
        fetchBomLineItems();
        fetchLifecycleChoices();
        fetchReferences();
      }
    }, [productIdString]);

    // Fetch all transport emissions
    const fetchEmissions = async () => {
      setIsLoading(true);
      try {
        const data = await transportEmissionApi.getAllTransportEmissions(
          company_pk,
          productId()
        );
        setEmissions(data);
      } catch (error) {
        console.error("Error fetching transport emissions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch BOM line items
    const fetchBomLineItems = async () => {
      try {
        const data = await bomApi.getAllLineItems(company_pk, productId());
        setBomLineItems(data);
      } catch (error) {
        console.error("Error fetching BOM items:", error);
      }
    };

    // Fetch lifecycle stage choices
    const fetchLifecycleChoices = async () => {
      try {
        const schema = (await transportEmissionApi.getTransportEmissionOptions(
          company_pk,
          productId()
        )) as {
          actions: {
            POST: {
              override_factors?: {
                child?: {
                  children?: {
                    lifecycle_stage?: {
                      choices: { value: string; display_name: string }[];
                    };
                  };
                };
              };
            };
          };
        };
        const choices =
          schema.actions.POST.override_factors?.child?.children?.lifecycle_stage
            ?.choices ?? [];
        setLifecycleChoices(choices);
      } catch (error) {
        console.error("Error fetching lifecycle stage choices:", error);
      }
    };

    // Fetch reference emission factors
    const fetchReferences = async () => {
      try {
        const data = await emissionReferenceApi.getAllTransportReferences();
        setReferences(data);
      } catch (error) {
        console.error("Error fetching transport references:", error);
      }
    };

    // Handle open modal for add/edit
    const handleOpenModal = (emission: TransportEmission | null = null) => {
      if (emission) {
        setCurrentEmission(emission);
        setFormData({
          distance: emission.distance.toString(),
          weight: emission.weight.toString(),
          reference: Number(emission.reference).toString(),
          override_factors:
            emission.override_factors?.map((f) => ({
              id: f.id,
              lifecycle_stage: f.lifecycle_stage,
              co_2_emission_factor_biogenic:
                f.co_2_emission_factor_biogenic ?? 0,
              co_2_emission_factor_non_biogenic:
                f.co_2_emission_factor_non_biogenic ?? 0,
            })) ?? [],
          line_items: emission.line_items ?? [],
        });
      } else {
        // Add new
        setCurrentEmission(null);
        setFormData({
          distance: "",
          weight: "",
          reference: "",
          override_factors: [],
          line_items: [],
        });
      }
      // Refresh BOM and lifecycle choices
      fetchBomLineItems();
      fetchLifecycleChoices();
      fetchReferences();
      setIsModalOpen(true);
    };

    const handleCloseModal = () => {
      setIsModalOpen(false);
      setCurrentEmission(null);
    };

    // Sum total emission factor for an emission
    const sumBioAndNonBioEmissions = (emission: TransportEmission): number => {
      if (
        !emission.reference_details ||
        !emission.reference_details.emission_factors
      ) {
        return 0;
      }
      return emission.reference_details.emission_factors.reduce(
        (total, factor) => {
          const biogenic = Number.isFinite(
            factor.co_2_emission_factor_biogenic
          ) 
            ? Number(factor.co_2_emission_factor_biogenic)
            : 0;
          const non_biogenic = Number.isFinite(
            factor.co_2_emission_factor_non_biogenic
          )
            ? Number(factor.co_2_emission_factor_non_biogenic)
            : 0;
          return total + biogenic + non_biogenic;
        },
        0
      );
    };

    const sumOverrideEmissions = (emission: TransportEmission): number => {
      if (!emission.override_factors || emission.override_factors.length === 0) {
        return 0;
      }

      return emission.override_factors.reduce((total, factor) => {
        const biogenic = factor.co_2_emission_factor_biogenic ?? 0;
        const nonBiogenic = factor.co_2_emission_factor_non_biogenic ?? 0;
        return total + biogenic + nonBiogenic;
      }, 0);
    };

    const computeTotalEmissions = (emission: TransportEmission): number => {
      if (emission.override_factors && emission.override_factors.length > 0) {
        return emission.override_factors.reduce((total, factor) => {
          const biogenic = factor.co_2_emission_factor_biogenic ?? 0;
          const nonBiogenic = factor.co_2_emission_factor_non_biogenic ?? 0;
          return total + biogenic + nonBiogenic;
        }, 0);
      } else {
        const emissionFactor = sumBioAndNonBioEmissions(emission);
        return emission.distance * emission.weight * emissionFactor;
      }
    };

    // Submit add or update
    const handleSubmit = async () => {
      const distanceNum = parseFloat(formData.distance);
      const weightNum = parseFloat(formData.weight);
      if (isNaN(distanceNum) || distanceNum <= 0) {
        alert("Please enter a valid distance (greater than 0).");
        return;
      }
      if (isNaN(weightNum) || weightNum <= 0) {
        alert("Please enter a valid weight (greater than 0).");
        return;
      }
      if (
        formData.override_factors.some(
          (factor) =>
            !factor.lifecycle_stage ||
            typeof factor.co_2_emission_factor_biogenic !== "number" ||
            isNaN(factor.co_2_emission_factor_biogenic) ||
            typeof factor.co_2_emission_factor_non_biogenic !== "number" ||
            isNaN(factor.co_2_emission_factor_non_biogenic)
        )
      ) {
        alert("Please fill in all override fields correctly.");
        return;
      }

      setIsSubmitting(true);
      try {
        const referenceId = formData.reference
          ? parseInt(formData.reference, 10)
          : 0;
        const payloadBase = {
          distance: distanceNum,
          weight: weightNum,
          reference: referenceId,
          override_factors: formData.override_factors.map((f) =>
            f.id
              ? {
                  id: f.id,
                  lifecycle_stage: f.lifecycle_stage,
                  co_2_emission_factor_biogenic: f.co_2_emission_factor_biogenic,
                  co_2_emission_factor_non_biogenic:
                    f.co_2_emission_factor_non_biogenic,
                }
              : {
                  lifecycle_stage: f.lifecycle_stage,
                  co_2_emission_factor_biogenic: f.co_2_emission_factor_biogenic,
                  co_2_emission_factor_non_biogenic:
                    f.co_2_emission_factor_non_biogenic,
                }
          ),
          line_items: formData.line_items.length
            ? formData.line_items
            : undefined,
        } as CreateTransportEmission & { override_factors: any[]; line_items?: number[] };

        if (currentEmission) {
          // Update existing
          await transportEmissionApi.updateTransportEmission(
            company_pk,
            productId(),
            currentEmission.id,
            payloadBase
          );
        } else {
          // Create new
          await transportEmissionApi.createTransportEmission(
            company_pk,
            productId(),
            payloadBase
          );
        }

        // Refresh list and close modal
        await fetchEmissions();
        setIsModalOpen(false);
        onFieldChange();
      } catch (error) {
        console.error("Error saving transport emission:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    // Delete confirmation
    const handleConfirmDelete = (emissionId: number) => {
      setDeletingEmissionId(emissionId);
      setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
      if (deletingEmissionId === null) return;
      try {
        await transportEmissionApi.deleteTransportEmission(
          company_pk,
          productId(),
          deletingEmissionId
        );
        setEmissions(
          emissions.filter((e) => e.id !== deletingEmissionId)
        );
        setIsDeleteModalOpen(false);
        onFieldChange();
      } catch (error) {
        console.error("Error deleting transport emission:", error);
      }
    };

    // Add override factor
    const handleAddOverrideFactor = () => {
      setFormData({
        ...formData,
        override_factors: [
          ...formData.override_factors,
          {
            lifecycle_stage: "" as LifecycleStage,
            co_2_emission_factor_biogenic: 0,
            co_2_emission_factor_non_biogenic: 0,
          },
        ],
      });
    };

    // Update override fields
    const handleOverrideFactorChange = (
      index: number,
      field: 'lifecycle_stage' | 'biogenic' | 'non_biogenic',
      raw: string            // 👈 the string from the <input>
    ) => {
      const updated = [...formData.override_factors];

      switch (field) {
        case 'lifecycle_stage':
          updated[index].lifecycle_stage = raw as LifecycleStage;
          break;

        case 'biogenic':
          updated[index].co_2_emission_factor_biogenic =
            raw.trim() === '' ? undefined : Number(raw);
          break;

        case 'non_biogenic':
          updated[index].co_2_emission_factor_non_biogenic =
            raw.trim() === '' ? undefined : Number(raw);
          break;
      }

      setFormData({ ...formData, override_factors: updated });
    };


    // Remove override factor
    const handleRemoveOverrideFactor = (index: number) => {
      const updated = [...formData.override_factors];
      updated.splice(index, 1);
      setFormData({
        ...formData,
        override_factors: updated,
      });
    };

    // Computed boolean to disable Save button
    const formIncomplete =
      !formData.distance.trim() ||
      !formData.weight.trim() ||
      !formData.reference ||
      formData.override_factors.some(
        (f) =>
          !f.lifecycle_stage ||
          isNaN(Number(f.co_2_emission_factor_biogenic)) ||
          isNaN(Number(f.co_2_emission_factor_non_biogenic))
      );

    return (
      <>
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Transportation Emissions
          </h2>
          <p className="mb-4">Add or manage transportation emissions.</p>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          {isLoading ? (
            <div className="text-center py-4">Loading…</div>
          ) : emissions.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No transport emissions added yet.
            </div>
          ) : (
            emissions.map((emission) => (
              <div
                key={emission.id}
                className="border rounded-lg p-4 mb-4 shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Emission #{emission.id}</h3>
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
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Distance:</div>
                  <div>{emission.distance} km</div>

                  <div className="text-gray-500">Weight:</div>
                  <div>{emission.weight} kg</div>

                  <div className="text-gray-500">Reference:</div>
                  <div>
                    {emission.reference_details?.name ??
                      emission.reference}
                  </div>

                  <div className="text-gray-500">Emission Factor:</div>
                  <div>{sumBioAndNonBioEmissions(emission).toFixed(3)}</div>

                  <div className="text-gray-500">Total kg CO₂e:</div>
                  <div>
                    {(() => {
                      const total = computeTotalEmissions(emission);
                      return Number.isFinite(total) ? total.toFixed(3) : "—";
                    })()}

                  </div>

                  {emission.override_factors &&
                    emission.override_factors.length > 0 ? (
                    <>
                      <div className="text-gray-500">Overrides:</div>
                      <div>
                        <button
                          onClick={() =>
                            setShowOverridesForEmission(emission)
                          }
                          className="underline"
                        >
                          View ({emission.override_factors.length})
                        </button>
                      </div>
                    </>
                  ) : null}

                  {emission.line_items && emission.line_items.length > 0 ? (
                    <>
                      <div className="text-gray-500">BOM Items:</div>
                      <div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowBomItemsForEmission(emission);
                          }}
                          className="underline"
                        >
                          View ({emission.line_items.length})
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">ID</th>
                <th className="p-2">Distance (km)</th>
                <th className="p-2">Weight (kg)</th>
                <th className="p-2">Reference</th>
                <th className="p-2">Emission Factor</th>
                <th className="p-2">Total kg CO₂e</th>
                <th className="p-2">Overrides</th>
                <th className="p-2">BOM Items</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-4 text-gray-500"
                  >
                    Loading…
                  </td>
                </tr>
              ) : emissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-4 text-gray-500"
                  >
                    No transport emissions added yet.
                  </td>
                </tr>
              ) : (
                emissions.map((emission) => (
                  <tr
                    key={emission.id}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="p-2">{emission.id}</td>
                    <td className="p-2">{emission.distance}</td>
                    <td className="p-2">{emission.weight}</td>
                    <td className="p-2">
                      {emission.reference_details?.name ??
                        emission.reference}
                    </td>
                    <td className="p-2">{sumBioAndNonBioEmissions(emission).toFixed(3)}</td>
                    <td className="p-2">
                      {(() => {
                        const total = computeTotalEmissions(emission);
                        return Number.isFinite(total) ? total.toFixed(3) : "—";
                      })()}
                    </td>
                    <td className="p-2">
                      {emission.override_factors &&
                        emission.override_factors.length > 0 ? (
                        <button
                          onClick={() =>
                            setShowOverridesForEmission(emission)
                          }
                          className="underline hover:underline text-sm"
                        >
                          View ({emission.override_factors.length})
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-2">
                      {emission.line_items &&
                      emission.line_items.length > 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowBomItemsForEmission(emission);
                          }}
                          className="underline hover:underline text-sm"
                        >
                          View ({emission.line_items.length})
                        </button>
                      ) : (
                        "—"
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

        {/* Add Emission Button */}
        <div className="mt-6">
          <Button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2"
            variant="primary"
          >
            <Plus className="w-4 h-4" /> Add Transport Emission
          </Button>
        </div>

        {/* Add/Edit Emission Modal */}
        <Dialog
          open={isModalOpen}
          as="div"
          className="fixed inset-0 overflow-y-auto pt-12 z-20"
          onClose={handleCloseModal}
        >
          <div className="min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-black/50" />
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <DialogPanel className="relative inline-block w-full max-w-lg p-6 my-8 overflow-visible text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
              <div className="flex justify-between items-center mb-4">
                <DialogTitle
                  as="h3"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {currentEmission
                    ? "Edit Transport Emission"
                    : "Add Transport Emission"}
                </DialogTitle>
                <button
                  onClick={handleCloseModal}
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
                    onChange={(e) =>
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
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    id="weight"
                    min="0"
                    step="0.01"
                    value={formData.weight ?? ""}
                    onChange={(e) =>
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
                          ? references.find(
                              (ref) =>
                                ref.id.toString() === formData.reference
                            )?.name || ""
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
                        const selected = references.find(
                          (ref) => ref.name === value
                        );
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
                          onChange={(e) =>
                            setReferenceQuery(e.target.value)
                          }
                          placeholder="Select a reference"
                        />
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDown
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </ComboboxButton>
                      </div>
                      <div className="relative w-full">
                        <ComboboxOptions className="absolute z-[200] max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {references
                            .filter(
                              (ref) =>
                                referenceQuery === "" ||
                                ref.name
                                  .toLowerCase()
                                  .includes(
                                    referenceQuery.toLowerCase()
                                  )
                            )
                            .map((ref) => (
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
                      {formData.line_items.map((itemId) => {
                        const item = bomLineItems.find(
                          (i) => i.id === itemId
                        );
                        return (
                          <div
                            key={itemId}
                            className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                          >
                            <span>
                              {item
                                ? item.line_item_product.name
                                : `Item #${itemId}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  line_items:
                                    formData.line_items.filter(
                                      (id) => id !== itemId
                                    ),
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
                        if (
                          value &&
                          !formData.line_items.includes(value)
                        ) {
                          setFormData({
                            ...formData,
                            line_items: [
                              ...formData.line_items,
                              value,
                            ],
                          });
                        }
                      }}
                    >
                      <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-left">
                        <ComboboxInput
                          className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white focus:ring-0 bg-white dark:bg-gray-700"
                          displayValue={() => bomLineItemQuery}
                          onChange={(e) =>
                            setBomLineItemQuery(e.target.value)
                          }
                          placeholder="Select BOM items to associate"
                        />
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDown
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </ComboboxButton>
                      </div>
                      <div className="relative w-full">
                        <ComboboxOptions className="absolute z-[200] max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {bomLineItems.length === 0 ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                              No BOM items available. Add items in the Bill
                              of Materials tab first.
                            </div>
                          ) : bomLineItems.filter(
                              (item) =>
                                !formData.line_items.includes(item.id) &&
                                (bomLineItemQuery === "" ||
                                  item.line_item_product.name
                                    .toLowerCase()
                                    .includes(
                                      bomLineItemQuery.toLowerCase()
                                    ))
                            ).length === 0 ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                              {bomLineItemQuery === ""
                                ? "All BOM items already selected."
                                : "No matching items found."}
                            </div>
                          ) : (
                            bomLineItems
                              .filter(
                                (item) =>
                                  !formData.line_items.includes(item.id) &&
                                  (bomLineItemQuery === "" ||
                                    item.line_item_product.name
                                      .toLowerCase()
                                      .includes(
                                        bomLineItemQuery.toLowerCase()
                                      ))
                              )
                              .map((item) => (
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
                      Override Reference Emissions
                    </label>
                    <button
                      type="button"
                      onClick={handleAddOverrideFactor}
                      className="text-sm text-red hover:text-red-800"
                    >
                      + Add Override
                    </button>
                  </div>

                  {formData.override_factors.map((factor, index) => (
                    <div
                      key={index}
                      className="mb-4 border p-3 rounded-lg dark:border-gray-700 relative"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveOverrideFactor(index)}
                        className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        aria-label="Remove override"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Lifecycle Stage Combobox */}
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Lifecycle Stage *
                      </label>
                      <div className="relative mb-3">
                        <Combobox
                          value={
                            factor.lifecycle_stage
                              ? lifecycleChoices.find(
                                  (opt) =>
                                    opt.value === factor.lifecycle_stage
                                )?.display_name || ""
                              : ""
                          }
                          onChange={(value: string | null) => {
                            if (!value) {
                              handleOverrideFactorChange(
                                index,
                                "lifecycle_stage",
                                ""
                              );
                              return;
                            }
                            const selected = lifecycleChoices.find(
                              (opt) => opt.display_name === value
                            );
                            handleOverrideFactorChange(
                              index,
                              "lifecycle_stage",
                              selected?.value || ""
                            );
                          }}
                        >
                          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-left">
                            <ComboboxInput
                              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white focus:ring-0 bg-white dark:bg-gray-700"
                              displayValue={(val: string) => val || ""}
                              onChange={(e) => {
                                // reuse for filtering
                                const query = e.target.value;
                                setLifecycleChoices((orig) =>
                                  orig.filter((opt) =>
                                    opt.display_name
                                      .toLowerCase()
                                      .includes(query.toLowerCase())
                                  )
                                );
                              }}
                              placeholder="Select lifecycle stage"
                            />
                            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                              <ChevronDown
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            </ComboboxButton>
                          </div>
                          <div className="relative w-full">
                            <ComboboxOptions className="absolute z-[200] max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {lifecycleChoices.length === 0 ? (
                                <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                                  No lifecycle stages found.
                                </div>
                              ) : (
                                lifecycleChoices.map((opt, i) => (
                                  <ComboboxOption
                                    key={i}
                                    value={opt.display_name}
                                    className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-white data-focus:bg-red-100 dark:data-focus:bg-red data-hover:bg-gray-100 dark:data-hover:bg-gray-600"
                                  >
                                    {opt.display_name}
                                  </ComboboxOption>
                                ))
                              )}
                            </ComboboxOptions>
                          </div>
                        </Combobox>
                      </div>

                      {/* Biogenic CO2 Field */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Biogenic CO₂ Emission (kg CO₂e) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={
                            Number.isFinite(factor.co_2_emission_factor_biogenic)
                              ? factor.co_2_emission_factor_biogenic
                              : ''
                          }
                          onChange={(e) =>
                            handleOverrideFactorChange(
                              index,
                              "biogenic",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                      </div>

                      {/* Non-Biogenic CO2 Field */}
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Non-Biogenic CO₂ Emission (kg CO₂e) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={
                            Number.isFinite(factor.co_2_emission_factor_non_biogenic)
                              ? factor.co_2_emission_factor_non_biogenic
                              : ''
                          }
                          onChange={(e) =>
                            handleOverrideFactorChange(
                              index,
                              "non_biogenic",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t dark:border-t-gray-700">
                <Button onClick={handleCloseModal} variant="outline">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="primary"
                  disabled={isSubmitting || formIncomplete}
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
              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <DialogPanel className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
                <DialogTitle className="flex items-center gap-3 mb-4 text-red">
                  <AlertCircle className="w-6 h-6" />
                  <span className="text-lg font-semibold">
                    Confirm Deletion
                  </span>
                </DialogTitle>
                <p className="mb-6">
                  Are you sure you want to delete this transport emission?
                  This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => setIsDeleteModalOpen(false)}
                    variant="outline"
                  >
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

        {/* Overrides Modal */}
        <Dialog
          open={!!showOverridesForEmission}
          as="div"
          className="fixed inset-0 z-20 overflow-y-auto"
          onClose={() => setShowOverridesForEmission(null)}
        >
          <div className="min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-black/50" />
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
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
                      {showOverridesForEmission.override_factors.map(
                        (factor, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                              {
                                lifecycleChoices.find(
                                  (c) => c.value === factor.lifecycle_stage
                                )?.display_name ?? factor.lifecycle_stage
                              }
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                              {factor.co_2_emission_factor_biogenic}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                              {factor.co_2_emission_factor_non_biogenic}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 dark:text-gray-300">
                    No overrides found.
                  </p>
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
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
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
                {showBomItemsForEmission?.line_items &&
                bomLineItems.length > 0 ? (
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
                        {showBomItemsForEmission.line_items.map((itemId) => {
                          const item = bomLineItems.find(
                            (i) => i.id === itemId
                          );
                          return (
                            <tr key={itemId}>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                {itemId}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                {item
                                  ? item.line_item_product.name
                                  : "Unknown Item"}
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
                  <p className="text-gray-500 dark:text-gray-300">
                    No BOM items found.
                  </p>
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

Transportation.displayName = "Transportation";
export default Transportation;
