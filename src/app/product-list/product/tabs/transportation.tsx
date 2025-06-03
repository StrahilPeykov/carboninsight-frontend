"use client";

import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import DropdownFieldGeneric from "./components/DropDownFieldGeneric";
import MultiSelectDropdown from "./components/MultiSelectDropdown";
import NumberField from "./components/NumberField";
import { Trash, Edit, Plus, X } from "lucide-react";
import { DataPassedToTabs, TabHandle } from "../page";
import { Mode } from "../enums";
import { useRouter } from "next/navigation";
import { bomApi } from "@/lib/api/bomApi";
import {
  transportEmissionApi,
  CreateTransportEmission,
  TransportEmission,
} from "@/lib/api/transportEmissionApi";
import { OverrideFactor, LifecycleStage } from "@/lib/api/materialEmissionApi";
import { emissionReferenceApi, EmissionReference } from "@/lib/api/emissionReferenceApi";

export type Material = {
  id: string;
  productName: string;
  supplierName: string;
  quantity: number;
  emission_total: number;
};

const Transportation = forwardRef<TabHandle, DataPassedToTabs>(
  ({ productId, tabKey, mode, setProductId, onFieldChange }, ref) => {
    const company_pk = localStorage.getItem("selected_company_id");
    const [isLoading, setIsLoading] = useState(false);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [transportEmissions, setTransportEmissions] = useState<TransportEmission[]>([]);
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [distance, setDistance] = useState<string>("");
    const [weight, setWeight] = useState<string>("");
    const [reference, setReference] = useState<string>("");
    const [referenceEmissionFactors, setReferenceEmissionFactors] = useState<EmissionReference[]>(
      []
    );
    const [overrideEmissons, setOverrideEmissons] = useState<OverrideFactor[]>([]);
    const [lifecycleStageChoices, setLifecycleStageChoices] = useState<LifecycleStageChoice[]>([]);
    const [selectedBOMLineItems, setSelectedBOMLineItems] = useState<string[]>([]);
    const [editingEmissionId, setEditingEmissionId] = useState<number | null>(null);

    useImperativeHandle(ref, () => ({ saveTab, updateTab }));

    const saveTab = async (): Promise<string> => {
      return "";
    };

    const updateTab = async (): Promise<string> => {
      return "";
    };

    // Fetch all BoM data
    useEffect(() => {
      // Only fetch in Edit mode
      if (mode == Mode.EDIT || mode == Mode.ADD) {
        fetchBOMItems();
        fetchTransportEmissions();
        fetchLifecycleStageChoices();
        fetchReferences();
      }
    }, [productId]);

    const handleClickToAddEmissions = () => {
      setIsModalOpen(true);
      setDistance("");
      setWeight("");
      setReference("");
      setOverrideEmissons([]);
    };

    const handleAddOrUpdateTransportEmission = async () => {
      setIsLoading(true);
      try {
        const createPayload: CreateTransportEmission = {
          distance: distance === "" ? 0 : Number(distance),
          weight: weight === "" ? 0 : Number(weight),
          reference: reference === "" ? 0 : Number(reference),
          override_factors: overrideEmissons.map(
            ({
              lifecycle_stage,
              co_2_emission_factor_non_biogenic,
              co_2_emission_factor_biogenic,
            }) => ({
              lifecycle_stage,
              co_2_emission_factor_non_biogenic: Number(co_2_emission_factor_non_biogenic),
              co_2_emission_factor_biogenic: Number(co_2_emission_factor_biogenic),
            })
          ),
          line_items: selectedBOMLineItems.map(id => parseInt(id)),
        };

        const updatePayload = {
          distance: Number(distance),
          weight: Number(weight),
          reference: Number(reference),
          override_factors: overrideEmissons.map(
            ({
              id,
              lifecycle_stage,
              co_2_emission_factor_non_biogenic,
              co_2_emission_factor_biogenic,
            }) =>
              id
                ? {
                    id,
                    lifecycle_stage,
                    co_2_emission_factor_non_biogenic: Number(co_2_emission_factor_non_biogenic),
                    co_2_emission_factor_biogenic: Number(co_2_emission_factor_biogenic),
                  } // update existing
                : {
                    lifecycle_stage,
                    co_2_emission_factor_non_biogenic: Number(co_2_emission_factor_non_biogenic),
                    co_2_emission_factor_biogenic: Number(co_2_emission_factor_biogenic),
                  } // create new
          ),
          line_items: selectedBOMLineItems.map(Number),
        };

        if (editingEmissionId) {
          // Update existing emission
          await transportEmissionApi.updateTransportEmission(
            Number(company_pk),
            Number(productId),
            editingEmissionId,
            updatePayload
          );
        } else {
          // Add new emission
          await transportEmissionApi.createTransportEmission(
            Number(company_pk),
            Number(productId),
            createPayload
          );
        }

        setEditingEmissionId(null);
        setSelectedBOMLineItems([]);
        setIsModalOpen(false);
        // refresh list
        await fetchTransportEmissions();
      } catch (err) {
        console.error("Failed to add/update transport emission:", err);
      } finally {
        setIsLoading(false);
        onFieldChange();
      }
    };

    const fetchBOMItems = async () => {
      if (!productId) {
        console.log("productId", productId);
      }
      try {
        const companyId = Number(localStorage.getItem("selected_company_id"));
        const lineItems = await bomApi.getAllLineItems(companyId, Number(productId));
        console.log("BOM items fetched:", lineItems);

        const transformed: Material[] = lineItems.map(item => ({
          id: item.id.toString(),
          productName: item.line_item_product.name,
          supplierName: item.line_item_product.manufacturer_name ?? "Unknown",
          quantity: item.quantity,
          emission_total: Number(
            (item.line_item_product.emission_total * item.quantity).toFixed(2)
          ),
        }));

        setMaterials(transformed);
      } catch (error) {
        console.error("Error fetching BoM items:", error);
      }
    };

    const fetchTransportEmissions = async () => {
      setIsLoading(true);
      try {
        const companyId = Number(localStorage.getItem("selected_company_id"));
        const data = await transportEmissionApi.getAllTransportEmissions(
          companyId,
          Number(productId)
        );

        setTransportEmissions(data);
      } catch (error) {
        console.error("Error fetching emissions items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    interface LifecycleStageChoice {
      value: string;
      display_name: string;
    }

    interface TransportEmissionSchema {
      actions: {
        POST: {
          override_factors?: {
            child?: {
              children?: {
                lifecycle_stage?: {
                  choices: LifecycleStageChoice[];
                };
              };
            };
          };
        };
      };
    }

    function sumTotalEmissions(emission: TransportEmission): number {
      if (!emission.reference_details || !emission.reference_details.emission_factors) {
        return 0;
      }

      return emission.reference_details.emission_factors.reduce((total, factor) => {
        const biogenic = Number.isFinite(factor.co_2_emission_factor_biogenic)
          ? factor.co_2_emission_factor_biogenic
          : 0;
        const non_biogenic = Number.isFinite(factor.co_2_emission_factor_non_biogenic)
          ? factor.co_2_emission_factor_non_biogenic
          : 0;

        return total + biogenic + non_biogenic;
      }, 0);
    }

    const fetchLifecycleStageChoices = async (): Promise<void> => {
      try {
        const token = localStorage.getItem("access_token");
        const companyPk = localStorage.getItem("selected_company_id");

        if (!token || !companyPk) {
          router.push("/login");
          return;
        }

        const schema = (await transportEmissionApi.getTransportEmissionOptions(
          Number(companyPk),
          Number(productId)
        )) as TransportEmissionSchema;

        let choices =
          schema?.actions?.POST?.override_factors?.child?.children?.lifecycle_stage?.choices ?? [];

        setLifecycleStageChoices(choices);
      } catch (err) {
        console.error("Error fetching lifecycle stages:", err);
      }
    };

    const fetchReferences = async () => {
      if (!productId) {
        console.log("productId", productId);
      }

      try {
        // Store possible reference emission factors
        const referenceData = await emissionReferenceApi.getAllTransportReferences();
        setReferenceEmissionFactors(referenceData);
      } catch (error) {
        console.error("Error fetching emissions items:", error);
      }
    };

    const handleDelete = async (id: number) => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const company_pk = localStorage.getItem("selected_company_id");

        if (!token || !company_pk) {
          router.push("/login");
          return;
        }

        transportEmissionApi.deleteTransportEmission(
          parseInt(company_pk || "0"),
          parseInt(productId || "0"),
          id
        );

        const updatedEmissions = transportEmissions.filter(
          transportEmission => transportEmission.id !== id
        );
        setTransportEmissions(updatedEmissions);
      } catch (error) {
        console.error("Error deleting transport emission:", error);
      } finally {
        setIsLoading(false);
        onFieldChange();
      }
    };

    const handleEdit = (id: number) => {
      const emission = transportEmissions.find(e => e.id === id);
      if (!emission) return;
      setEditingEmissionId(id);
      setIsModalOpen(true);
      setDistance(emission.distance.toString());
      setWeight(emission.weight.toString());
      setReference(emission.reference.toString());
      setOverrideEmissons(
        (emission.override_factors || []).map(f => ({
          ...f,
          co_2_emission_factor_non_biogenic: f.co_2_emission_factor_non_biogenic,
        }))
      );
      setSelectedBOMLineItems(
        emission.line_items ? emission.line_items.map(item => item.toString()) : []
      );
    };

    const overridesIncomplete = overrideEmissons.some(
      o =>
        !o.lifecycle_stage ||
        o.co_2_emission_factor_non_biogenic === undefined ||
        o.co_2_emission_factor_non_biogenic === null ||
        isNaN(Number(o.co_2_emission_factor_non_biogenic))
    );

    const formIncomplete = !distance.trim() || !weight.trim() || !reference || overridesIncomplete;

    return (
      <>
        <div>
          <h2 className="text-xl font-semibold mb-4">Transportation emissions</h2>
          <p className="mb-4">Add transportation emissions.</p>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <td className="p-2">Distance</td>
              <td className="p-2">Weight</td>
              <td className="p-2">Emission factor (reference)</td>
              <td className="p-2 hidden md:table-cell">Category</td>
              <td className="p-2 hidden md:table-cell">Lifecycle stage</td>
              <td className="p-2">Emissions (kg CO2e)</td>
              <td className="p-2">Actions</td>
            </tr>
          </thead>
          <tbody>
            {transportEmissions.map((emission, idx) =>
              emission.override_factors && emission.override_factors.length > 0 ? (
                emission.override_factors.map((factor, fIdx) => (
                  // Render each override factor as a separate row
                  <tr
                    key={`${emission.id}-${factor.id ?? fIdx}`}
                    className="border-b hover:bg-gray-400 border-l-4"
                  >
                    <td className="p-2">{emission.distance}</td>
                    <td className="p-2">{emission.weight}</td>
                    <td className="p-2">{sumTotalEmissions(emission)}</td>
                    <td className="p-2 hidden md:table-cell">Overridden</td>
                    <td className="p-2 hidden md:table-cell">{factor.lifecycle_stage}</td>
                    <td className="p-2">{factor.co_2_emission_factor_non_biogenic}</td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(emission.id)}
                          className="p-1 hover:bg-gray-100 rounded-full"
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(emission.id)}
                          className="p-1 hover:bg-gray-100 rounded-full"
                        >
                          <Trash className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                // Render non-overridden emission rows
                <tr key={emission.id} className="border-b hover:bg-gray-400">
                  <td className="p-2">{emission.distance}</td>
                  <td className="p-2">{emission.weight}</td>
                  <td className="p-2">{sumTotalEmissions(emission)}</td>
                  <td className="p-2 hidden md:table-cell">{emission.reference_details.name}</td>
                  <td className="p-2 hidden md:table-cell"></td>
                  <td className="p-2">
                    {Number.isFinite(
                      emission.distance * emission.weight * sumTotalEmissions(emission)
                    )
                      ? emission.distance * emission.weight * sumTotalEmissions(emission)
                      : "-"}
                  </td>
                  <td className="p-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(emission.id)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <Edit className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(emission.id)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
            {transportEmissions.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-4">
                  No transport emissions added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="mt-6">
          <Button
            onClick={handleClickToAddEmissions}
            className="flex items-center gap-2"
            variant="primary"
          >
            <Plus className="w-4 h-4" /> Add an emission
          </Button>
        </div>
        {/* Add Transport Emission Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 overflow-y-auto">
            <Card className="w-full max-w-screen-sm px-0 sm:px-0">
              <div className="flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 px-4 sm:px-4 flex-shrink-0">
                  <h3 className="text-lg font-semibold">Enter transport emission details</h3>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedBOMLineItems([]);
                    }}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="mb-4 w-full px-4 sm:px-4 pr-6">
                  {
                    <div className="mb-4 w-full overflow-visible">
                      <NumberField
                        name="distance"
                        label="Distance"
                        value={distance}
                        placeholder="100"
                        required={true}
                        step={1}
                        onFieldChange={setDistance}
                      />
                      <NumberField
                        name="weight"
                        label="Weight"
                        value={weight}
                        placeholder="1"
                        required={true}
                        onFieldChange={setWeight}
                      />
                      <DropdownFieldGeneric
                        name="reference"
                        label="Reference Emission Factor"
                        value={reference?.toString() || ""}
                        required={true}
                        placeholder="Select reference emission factor"
                        options={referenceEmissionFactors.map(ref => ({
                          value: String(ref.id),
                          display_name: ref.name,
                        }))}
                        onFieldChange={(val: string) => setReference(val)}
                        dropdownMaxHeight="max-h-[160px]"
                      />
                      <div className="flex-1 min-h-0 overflow-visible">
                        <MultiSelectDropdown
                          label="Related BoM Items"
                          options={materials.map(material => ({
                            value: material.id,
                            display_name: material.productName,
                          }))}
                          selectedValues={selectedBOMLineItems}
                          onChange={setSelectedBOMLineItems}
                        />
                        <div className="relative mb-4 overflow-visible">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-4">
                              Override reference emissions
                            </label>
                            <div className="flex flex-col space-y-2 overflow-visible">
                              {overrideEmissons.map((override, index) => (
                                <div
                                  key={index}
                                  className="flex flex-col md:flex-row gap-4 w-full md:items-center"
                                >
                                  {/* Lifecycle stage dropdown */}
                                  <div className="w-full md:w-1/2">
                                    <DropdownFieldGeneric
                                      name={`lifecycle_stage_${index}`}
                                      label="Lifecycle Stage"
                                      value={override.lifecycle_stage}
                                      required={true}
                                      placeholder="Select lifecycle stage"
                                      options={lifecycleStageChoices.map(
                                        ({ value, display_name }) => ({
                                          value,
                                          display_name,
                                        })
                                      )}
                                      onFieldChange={(val: string) => {
                                        const updated = [...overrideEmissons];
                                        updated[index].lifecycle_stage = val as LifecycleStage;
                                        setOverrideEmissons(updated);
                                      }}
                                      dropdownMaxHeight="max-h-[150px]"
                                    />
                                  </div>

                                  {/* CO2 emission factor input */}
                                  <div className="w-full md:w-1/2">
                                    <NumberField
                                      name={`co2_emission_${index}`}
                                      label="CO₂ Emissions (kg CO₂e)"
                                      value={
                                        override.co_2_emission_factor_non_biogenic?.toString() || ""
                                      }
                                      placeholder="100"
                                      required={true}
                                      onFieldChange={val => {
                                        const updated = [...overrideEmissons];
                                        updated[index].co_2_emission_factor_non_biogenic =
                                          val === "" ? undefined : Number(val);
                                        setOverrideEmissons(updated);
                                      }}
                                    />
                                  </div>

                                  {/* Remove override button */}
                                  <div className="flex justify-end md:justify-center items-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = overrideEmissons.filter(
                                          (_, i) => i !== index
                                        );
                                        setOverrideEmissons(updated);
                                      }}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {/* Add new override */}
                              <div className="mt-2">
                                <Button
                                  type="button"
                                  variant="primary"
                                  className="flex items-center gap-2"
                                  onClick={() =>
                                    setOverrideEmissons([
                                      ...overrideEmissons,
                                      {
                                        lifecycle_stage: "" as LifecycleStage,
                                        co_2_emission_factor_non_biogenic: 0, // <-- string
                                        co_2_emission_factor_biogenic: 0, // <-- string
                                      },
                                    ])
                                  }
                                >
                                  <Plus className="w-4 h-4" /> Add override
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
                {/* Footer */}
                <div className="flex justify-between mt-6 pt-4 border-t px-4 sm:px-4 flex-shrink-0">
                  {
                    <>
                      <Button
                        onClick={() => {
                          setIsModalOpen(false);
                          setEditingEmissionId(null);
                          setSelectedBOMLineItems([]);
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>

                      <Button
                        onClick={handleAddOrUpdateTransportEmission}
                        variant={formIncomplete ? "outline" : "primary"}
                        disabled={formIncomplete}
                      >
                        {editingEmissionId ? "Update Emission" : "Add Emission"}
                      </Button>
                    </>
                  }
                </div>
              </div>
            </Card>
          </div>
        )}
      </>
    );
  }
);

Transportation.displayName = "Transportation";
export default Transportation;
