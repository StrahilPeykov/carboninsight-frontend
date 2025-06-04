"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Info,
  Trash,
  Edit,
  Plus,
  X,
  Search,
  ChevronRight,
  Clock,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import { useRouter } from "next/navigation";
import { DataPassedToTabs, TabHandle } from "../page";
import { bomApi, LineItem } from "@/lib/api/bomApi";
import { companyApi, Company } from "@/lib/api/companyApi";
import { productApi, Product } from "@/lib/api/productApi";
import { Mode } from "../enums";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

export type Material = {
  id: number;
  productName: string;
  supplierName: string;
  quantity: number;
  emission_total: number;
  supplierId: number;
  productId: number;
  product_sharing_request_status: "Pending" | "Accepted" | "Rejected" | "Not requested";
  reference_impact_unit: string;
};

const BillOfMaterials = forwardRef<TabHandle, DataPassedToTabs>(
  ({ productId: productId_string, tabKey, mode, setProductId, onFieldChange }, ref) => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState<string>("1");
    const [searchCompany, setSearchCompany] = useState("");
    const [searchProduct, setSearchProduct] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newQuantity, setNewQuantity] = useState<string>("1");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteMaterial, setDeleteMaterial] = useState<Material | null>(null);
    const [mainProduct, setMainProduct] = useState<Product | null>(null);
    const [addMaterialError, setAddMaterialError] = useState<string | null>(null);
    const [isEstimationMode, setIsEstimationMode] = useState(false);

    let company_pk_string = localStorage.getItem("selected_company_id");

    if (!company_pk_string) {
      console.error("company_pk is null");
      return;
    }

    const company_pk = parseInt(company_pk_string, 10);

    const productId = () => {
      const id = parseInt(productId_string, 10);

      if (isNaN(id)) {
        throw new Error("productId is not a number");
      }

      return id;
    };

    useImperativeHandle(ref, () => ({ saveTab, updateTab }));

    const saveTab = async (): Promise<string> => {
      return "";
    };

    const updateTab = async (): Promise<string> => {
      return "";
    };

    // Fetch companies
    const fetchCompanies = async (search = "") => {
      setIsLoading(true);
      try {
        const searchParam = search.length >= 4 ? `?search=${encodeURIComponent(search)}` : "";

        const data = await companyApi.searchAllCompanies(searchParam);
        setCompanies(data);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch products from selected company
    const fetchProducts = async (companyId: string, search = "") => {
      if (!companyId) return;
      setIsLoading(true);
      try {
        const searchParam = search.length >= 4 ? `?search=${encodeURIComponent(search)}` : "";

        const data = await productApi.searchProducts(companyId, searchParam);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      if (
        isModalOpen &&
        currentStep === 1 &&
        (searchCompany.length >= 4 || searchCompany.length === 0)
      ) {
        fetchCompanies(searchCompany);
      }
    }, [isModalOpen, searchCompany]);

    useEffect(() => {
      // Here is length at least 2 since there are 2 character products (e.g. "TV")
      if (
        selectedCompany &&
        currentStep === 2 &&
        (searchProduct.length >= 2 || searchProduct.length === 0)
      ) {
        fetchProducts(selectedCompany.id, searchProduct);
      }
    }, [selectedCompany, searchProduct, currentStep]);

    useEffect(() => {
      const fetchMain = async () => {
        try {
          const prod = await productApi.getProduct(company_pk_string, productId_string);
          setMainProduct(prod);
        } catch (e) {
          console.error("Error loading main product", e);
        }
      };
      fetchMain();
    }, [company_pk_string, productId_string]);

    const handleEdit = (id: number) => {
      const foundMaterial = materials.find((m: Material) => m.id === id);
      if (foundMaterial) {
        setEditingMaterial(foundMaterial);
        setNewQuantity(foundMaterial.quantity.toString());
        setIsEditModalOpen(true);
      }
    };

    const handleUpdateQuantity = async () => {
      const parsedQuantity = parseInt(newQuantity);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        alert("Please enter a valid quantity greater than 0");
        return;
      }

      if (!editingMaterial) {
        return;
      }

      try {
        const token = localStorage.getItem("access_token");
        if (!token || !company_pk) {
          router.push("/login");
          return;
        }

        await bomApi.updateLineItem(company_pk, productId(), editingMaterial.id, {
          quantity: parsedQuantity,
          line_item_product_id: undefined,
        });

        const updatedMaterials = materials.map(material => {
          if (material.id === editingMaterial.id) {
            return {
              ...material,
              quantity: parsedQuantity,
              emission_total: parseFloat(
                ((material.emission_total / material.quantity) * parsedQuantity).toFixed(2)
              ),
            };
          }
          return material;
        });

        setMaterials(updatedMaterials);
        setIsEditModalOpen(false);
        setEditingMaterial(null);
        onFieldChange();
      } catch (error) {
        console.error("Error updating material:", error);
      }
    };

    const handleAddMaterial = () => {
      setIsModalOpen(true);
      setCurrentStep(1);
      setSelectedCompany(null);
      setSelectedProduct(null);
      setQuantity("1");
      setSearchCompany("");
      setSearchProduct("");
    };

    const handleSelectCompany = (company: Company) => {
      setSelectedCompany(company);
      setCurrentStep(2);
      setSearchProduct("");
      setProducts([]);
    };

    const handleAddProduct = async () => {
      setAddMaterialError(null);

      const parsedQuantity = parseInt(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        alert("Please enter a valid quantity greater than 0");
        return;
      }

      if (selectedProduct && selectedCompany) {
        try {
          const responseData = await bomApi.createNewLineItem(company_pk, productId(), {
            quantity: parsedQuantity,
            line_item_product_id: parseInt(selectedProduct.id),
          });

          const newMaterial = {
            id: responseData.id,
            productName: selectedProduct.name,
            supplierName: selectedCompany.name || "Unknown",
            quantity: parsedQuantity,
            emission_total: parseFloat(
              (selectedProduct.emission_total * parsedQuantity).toFixed(2)
            ),
            supplierId: parseInt(selectedCompany.id),
            productId: parseInt(selectedProduct.id),
            product_sharing_request_status: responseData.product_sharing_request_status,
            reference_impact_unit: selectedProduct.reference_impact_unit,
          };

          const updatedMaterials = [...materials, newMaterial];
          setMaterials(updatedMaterials);
          setIsModalOpen(false);
          onFieldChange();
        } catch (error: unknown) {
          console.error("Error adding material:", error);

          // Log the entire error object to see what we're working with
          console.log("Full error response:", JSON.stringify(error));

          let errorMessage = "Failed to add material. Please try again.";

          // Try to extract error from various possible formats
          try {
            if (typeof error === "object" && error !== null) {
              // Try to extract directly from the response data
              const errorObj = error as any;

              // Check for errors array in the raw error object
              if (errorObj.errors && Array.isArray(errorObj.errors)) {
                const detail = errorObj.errors.find(
                  (e: any) => e.attr === "non_field_errors"
                )?.detail;
                if (detail) {
                  errorMessage = detail;
                }
              }

              // Check in response property (common in fetch/axios wrappers)
              else if (errorObj.response?.data?.errors) {
                const detail = errorObj.response.data.errors.find(
                  (e: any) => e.attr === "non_field_errors"
                )?.detail;
                if (detail) {
                  errorMessage = detail;
                }
              }

              // Check in body property (common in some API clients)
              else if (errorObj.body?.errors) {
                const detail = errorObj.body.errors.find(
                  (e: any) => e.attr === "non_field_errors"
                )?.detail;
                if (detail) {
                  errorMessage = detail;
                }
              }

              // Access potentially raw error data
              else if (errorObj.data?.errors) {
                const detail = errorObj.data.errors.find(
                  (e: any) => e.attr === "non_field_errors"
                )?.detail;
                if (detail) {
                  errorMessage = detail;
                }
              }
            }
          } catch (parseError) {
            console.error("Error parsing error response:", parseError);
          }

          setAddMaterialError(errorMessage);
        }
      }
    };

    useEffect(() => {
      // Check if we're in step 2 and have either a selected company or estimation mode
      if (
        currentStep === 2 &&
        selectedCompany &&
        (searchProduct.length >= 2 || searchProduct.length === 0)
      ) {
        fetchProducts(selectedCompany.id, searchProduct);
      }
    }, [selectedCompany, searchProduct, currentStep]);

    // Fetch all BoM data
    useEffect(() => {
      if (mode == Mode.EDIT) {
        fetchBOMItems();
      }
    }, [mode]);

    const fetchBOMItems = async () => {
      try {
        const data = await bomApi.getAllLineItems(company_pk, productId());

        const transformedMaterials: Material[] = data.map((item: LineItem) => ({
          id: item.id,
          productName: item.line_item_product.name,
          supplierName: item.line_item_product.manufacturer_name || "Unknown",
          quantity: item.quantity,
          emission_total: parseFloat(
            (item.line_item_product.emission_total * item.quantity).toFixed(2)
          ),
          supplierId: item.line_item_product.supplier,
          productId: item.line_item_product.id,
          product_sharing_request_status: item.product_sharing_request_status,
          reference_impact_unit: item.line_item_product.reference_impact_unit,
        }));

        setMaterials(transformedMaterials);
      } catch (error) {
        console.error("Error fetching BoM items:", error);
      }
    };

    const handleInfoClick = (materialId: number) => {
      const material = materials.find(m => m.id === materialId);
      if (material) {
        window.open(
          `/product-list/emissions-tree?cid=${material.supplierId}&id=${material.productId}`,
          "_blank"
        );
      }
    };

    const handleRequestAccess = async (materialId: number) => {
      const material = materials.find(m => m.id === materialId);
      if (material) {
        try {
          await productApi.requestProductSharing(
            material.supplierId,
            company_pk,
            material.productId
          );
          const updatedMaterials = materials.map(m => {
            if (m.id === materialId) {
              return {
                ...m,
                product_sharing_request_status: "Pending" as const,
              };
            }
            return m;
          });
          setMaterials(updatedMaterials);
        } catch (error) {
          console.error("Error adding material:", error);
        }
      }
    };

    const closeModal = () => {
      setIsModalOpen(false);
      setAddMaterialError(null);
      setCurrentStep(1);
      setSelectedCompany(null);
      setSelectedProduct(null);
      setQuantity("1");
      setIsEstimationMode(false);
    };

    function openDeleteModal(item: Material) {
      setDeleteMaterial(item);
      setIsDeleteModalOpen(true);
    }
    function closeDeleteModal() {
      setDeleteMaterial(null);
      setIsDeleteModalOpen(false);
    }
    async function confirmDelete() {
      if (!deleteMaterial) return;
      try {
        await bomApi.deleteLineItem(company_pk, productId(), deleteMaterial.id);
        // update list and notify parent
        setMaterials(mats => mats.filter(m => m.id !== deleteMaterial.id));
        onFieldChange();
      } catch (e) {
        console.error("Delete failed", e);
      } finally {
        closeDeleteModal();
      }
    }

    const handleEstimationButton = async () => {
      try {
        const referenceCompany = await companyApi.getCompany("reference");

        setIsEstimationMode(true);
        setSelectedCompany(referenceCompany);
        setCurrentStep(2);
        setSearchProduct("");
      } catch (error) {
        console.error("Error fetching reference company:", error);
        setIsEstimationMode(true);
        setSelectedCompany({
          id: "reference",
          name: "Reference Database",
          vat_number: "",
          business_registration_number: "",
        });
        setCurrentStep(2);
        setSearchProduct("");
      }
    };

    return (
      <>
        <div>
          <h2 className="text-xl font-semibold mb-4">Bill of Materials</h2>
          <p className="mb-4">Add product parts to the bill of materials.</p>
        </div>

        {/* Mobile view (card layout) */}
        <div className="md:hidden">
          {materials.length === 0 ? (
            <div className="text-center text-gray-500 py-4">No materials added yet.</div>
          ) : (
            materials.map((material, idx) => (
              <div key={idx} className="border rounded-lg p-4 mb-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{material.productName}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(material.id)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <Edit className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(material)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <Trash className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">ID:</div>
                  <div>{material.id}</div>
                  <div className="text-gray-500">Supplier:</div>
                  <div>{material.supplierName}</div>
                  <div className="text-gray-500">Quantity:</div>
                  <div>{`${material.quantity} ${material.reference_impact_unit}`}</div>
                  <div className="text-gray-500">Emission:</div>
                  <div className="flex items-center gap-1">
                    {material.product_sharing_request_status === "Accepted" && (
                      <>
                        {material.emission_total} kg
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleInfoClick(material.id);
                          }}
                          className="hover:bg-gray-100 rounded-full p-0.5"
                        >
                          <Info className="w-4 h-4 text-gray-400" />
                        </button>
                      </>
                    )}
                    {material.product_sharing_request_status === "Pending" && (
                      <>
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs">Pending</span>
                      </>
                    )}
                    {material.product_sharing_request_status === "Rejected" && (
                      <>
                        <EyeOff className="w-4 h-4 text-red-500"></EyeOff>
                        <span className="text-xs">Access denied</span>
                      </>
                    )}
                    {material.product_sharing_request_status === "Not requested" && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleRequestAccess(material.id);
                        }}
                        className="text-xs bg-red hover:bg-red-800 text-white px-2 py-1 rounded"
                      >
                        Request access
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop view (table layout) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Product ID</th>
                <th className="p-2">Product Name</th>
                <th className="p-2">Supplier</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Total Emission</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-2">{material.id}</td>
                  <td className="p-2">{material.productName}</td>
                  <td className="p-2">{material.supplierName}</td>
                  <td className="p-2">{`${material.quantity} ${material.reference_impact_unit}`}</td>
                  <td className="p-2 flex items-center gap-1">
                    {material.product_sharing_request_status === "Accepted" && (
                      <>
                        {material.emission_total} kg
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleInfoClick(material.id);
                          }}
                          className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-0.5"
                        >
                          <Info className="w-4 h-4 text-gray-400" />
                        </button>
                      </>
                    )}
                    {material.product_sharing_request_status === "Pending" && (
                      <>
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span>Pending</span>
                      </>
                    )}
                    {material.product_sharing_request_status === "Rejected" && (
                      <>
                        <EyeOff className="w-4 h-4 text-red-500" />
                        <span>Access denied</span>
                      </>
                    )}
                    {material.product_sharing_request_status === "Not requested" && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleRequestAccess(material.id);
                        }}
                        className="text-xs bg-red hover:bg-red-800 text-white px-2 py-1 rounded"
                      >
                        Request access
                      </button>
                    )}
                  </td>
                  <td className="p-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(material.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                      >
                        <Edit className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(material)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-4">
                    No materials added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Material button */}
        <div className="mt-6">
          <Button onClick={handleAddMaterial} className="flex items-center gap-2" variant="primary">
            <Plus className="w-4 h-4" /> Add a material
          </Button>
        </div>

        {/* Add Material Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-60 overflow-y-auto py-8">
            <div className="min-h-full flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl my-auto">
                <div className="p-3 sm:p-5">
                  {/* Header with title and close button */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold truncate pr-2">
                      {currentStep === 1 ? "Step 1: Select a Company" : "Step 2: Select a Product"}
                    </h3>
                    <button
                      onClick={closeModal}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Stepper UI */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 1 ? "bg-gray-100 dark:bg-gray-600" : "bg-red text-white"}`}
                      >
                        1
                      </div>
                      <div className="mx-2 w-16 h-0.5 bg-gray-300"></div>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-600`}
                      >
                        2
                      </div>
                    </div>
                  </div>

                  {/* Step content */}
                  {currentStep === 1 && (
                    <>
                      <div>
                        <div className="relative mb-4">
                          <input
                            type="text"
                            placeholder="Search companies..."
                            value={searchCompany}
                            onChange={e => setSearchCompany(e.target.value)}
                            className="w-full p-2 pl-10 border rounded-lg"
                          />
                          <Search className="w-5 h-5 absolute left-2 top-2.5 text-gray-400" />
                        </div>

                        <div className="max-h-[40vh] sm:max-h-80 overflow-y-auto">
                          {isLoading ? (
                            <div className="text-center py-4">Loading...</div>
                          ) : companies.length > 0 ? (
                            companies.map(company => (
                              <div
                                key={company.id}
                                onClick={() => handleSelectCompany(company)}
                                className="p-3 border-b hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer flex justify-between items-center"
                              >
                                <div className="overflow-hidden">
                                  <p className="font-medium truncate">{company.name}</p>
                                  {company.business_registration_number && (
                                    <p className="text-xs text-gray-500 truncate">
                                      Reg: {company.business_registration_number}
                                    </p>
                                  )}
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-gray-500">No companies found</div>
                          )}
                        </div>
                      </div>
                      <Button onClick={handleEstimationButton} className="mt-4">
                        Add by estimation
                      </Button>
                    </>
                  )}

                  {/* Step 2: Select Product */}
                  {currentStep === 2 && selectedCompany && (
                    <div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">
                          {isEstimationMode ? "Estimation Mode:" : "Selected Company:"}
                        </p>
                        <p className="font-medium truncate">{selectedCompany.name}</p>
                        {isEstimationMode && (
                          <p className="text-xs text-amber-600 mt-1">
                            Using reference values for estimation purposes
                          </p>
                        )}
                      </div>
                      <div>
                        {/* Error message display */}
                        {addMaterialError && (
                          <div className="mb-4 p-3 text-sm bg-red-100 border border-red-200 text-red-800 rounded-lg">
                            <p>{addMaterialError}</p>
                          </div>
                        )}

                        <div className="relative mb-4">
                          <input
                            type="text"
                            placeholder="Search products..."
                            value={searchProduct}
                            onChange={e => setSearchProduct(e.target.value)}
                            className="w-full p-2 pl-10 border rounded-lg"
                          />
                          <Search className="w-5 h-5 absolute left-2 top-2.5 text-gray-400" />
                        </div>

                        <div className="max-h-60 overflow-y-auto mb-4">
                          {isLoading ? (
                            <div className="text-center py-4">Loading products...</div>
                          ) : products.length > 0 ? (
                            products.map(product => (
                              <div
                                key={product.id}
                                onClick={() => setSelectedProduct(product)}
                                className={`p-3 border rounded-lg mb-2 cursor-pointer ${selectedProduct?.id === product.id ? "bg-grey-50 dark:bg-gray-700" : "hover:bg-gray-50 dark:hover:bg-gray-900"}`}
                              >
                                <p className="font-medium">{product.name}</p>
                                <div className="flex justify-between text-sm text-gray-500 mt-1">
                                  <span>SKU: {product.sku || "N/A"}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-gray-500">No products found</div>
                          )}
                        </div>

                        {selectedProduct && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              Quantity ({selectedProduct.reference_impact_unit})
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={e => setQuantity(e.target.value)}
                              className="w-full p-2 border rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer with buttons */}
                  <div className="flex justify-between mt-6 pt-4 border-t">
                    {currentStep === 2 ? (
                      <>
                        <Button
                          onClick={() => {
                            setCurrentStep(1);
                            setIsEstimationMode(false);
                            setAddMaterialError(null);
                          }}
                          variant="outline"
                          className="mr-2"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleAddProduct}
                          variant="primary"
                          disabled={!selectedProduct || parseInt(quantity) <= 0 || quantity === ""}
                        >
                          Add Material
                        </Button>
                      </>
                    ) : (
                      <Button onClick={closeModal} variant="outline" className="ml-auto">
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Edit Material Modal */}
        {isEditModalOpen && editingMaterial && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20">
            <Card className="w-11/12 max-w-md">
              <div>
                {/* Header with title and close button */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Edit Material Quantity</h3>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Material Information */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Product:</p>
                  <p className="font-medium">{editingMaterial.productName}</p>

                  <p className="text-sm text-gray-500 mt-2">Supplier:</p>
                  <p className="font-medium">{editingMaterial.supplierName}</p>
                </div>

                {/* Quantity Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newQuantity}
                    onChange={e => setNewQuantity(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                {/* Footer with buttons */}
                <div className="flex justify-between mt-6 pt-4 border-t">
                  <Button onClick={() => setIsEditModalOpen(false)} variant="outline">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateQuantity}
                    variant="primary"
                    disabled={parseInt(newQuantity) <= 0 || newQuantity === ""}
                  >
                    Update Quantity
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        <Dialog
          open={isDeleteModalOpen}
          as="div"
          className="fixed inset-0 z-20 overflow-y-auto"
          onClose={closeDeleteModal}
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
                Are you sure you want to delete
                <span className="font-medium"> {deleteMaterial?.productName}</span>? This action
                cannot be undone.
              </p>

              <div className="flex justify-end gap-2">
                <Button onClick={closeDeleteModal} variant="outline">
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  variant="primary"
                  className="bg-red hover:bg-red-800 text-white"
                >
                  Delete
                </Button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      </>
    );
  }
);

BillOfMaterials.displayName = "BillOfMaterials";
export default BillOfMaterials;
