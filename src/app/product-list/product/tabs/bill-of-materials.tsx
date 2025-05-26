"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Info, Trash, Edit, Plus, X, Search, ChevronRight, Clock, EyeOff } from "lucide-react";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import { useRouter } from "next/navigation";
import { DataPassedToTabs, TabHandle } from "../page";
import { bomApi, LineItem } from "@/lib/api/bomApi";
import { companyApi, Company } from "@/lib/api/companyApi";
import { productApi, Product } from "@/lib/api/productApi";

export type Material = {
  id: number;
  productName: string;
  supplierName: string;
  quantity: number;
  emission_total: number;
  supplierId: number;
  productId: number;
  product_sharing_request_status: "Pending" | "Accepted" | "Rejected" | "Not requested";
};

const BillOfMaterials = forwardRef<TabHandle, DataPassedToTabs>(
  (
    { productId: productId_string, setProductId, onFieldChange, onTabSaved, onTabSaveError },
    ref
  ) => {
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

    useImperativeHandle(ref, () => ({ saveTab }));

    const saveTab = async (): Promise<boolean> => {
      onTabSaved();
      return true;
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

    const handleDelete = async (id: number) => {
      try {
        await bomApi.deleteLineItem(company_pk, productId(), id);

        const updatedMaterials = materials.filter(material => material.id !== id);
        setMaterials(updatedMaterials);
      } catch (error) {
        console.error("Error deleting material:", error);
      }
    };

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
            supplierName: selectedCompany.name,
            quantity: parsedQuantity,
            emission_total: parseFloat(
              (selectedProduct.emission_total * parsedQuantity).toFixed(2)
            ),
            supplierId: parseInt(selectedCompany.id),
            productId: parseInt(selectedProduct.id),
            product_sharing_request_status: responseData.product_sharing_request_status,
          };

          const updatedMaterials = [...materials, newMaterial];
          setMaterials(updatedMaterials);
          setIsModalOpen(false);
        } catch (error) {
          console.error("Error adding material:", error);
        }
      }
    };

    // Fetch all BoM data
    useEffect(() => {
      // Only fetch when we have a valid product ID, and we're viewing the BoM tab
      if (productId_string) {
        fetchBOMItems();
      }
    }, [productId_string]);

    const fetchBOMItems = async () => {
      try {
        const data = await bomApi.getAllLineItems(company_pk, productId());

        const transformedMaterials: Material[] = data.map((item: LineItem) => ({
          id: item.id,
          productName: item.line_item_product.name,
          supplierName: item.line_item_product.manufacturer || "Unknown",
          quantity: item.quantity,
          emission_total: (item.calculate_emissions ?? []).reduce(
            (total, e) => total + e.quantity,
            0
          ),
          supplierId: item.line_item_product.supplier,
          productId: item.line_item_product.id,
          product_sharing_request_status: item.product_sharing_request_status,
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
                      onClick={() => handleDelete(material.id)}
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
                  <div>{material.quantity}</div>
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
                  <td className="p-2">{material.quantity}</td>
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
                        onClick={() => handleDelete(material.id)}
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20">
            <Card className="w-11/12 max-w-2xl">
              <div>
                {/* Header with title and close button */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {currentStep === 1 ? "Step 1: Select a Company" : "Step 2: Select a Product"}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Stepper UI */}
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 1 ? "bg-red text-white" : "bg-blue-100 text-blue-500"}`}
                    >
                      1
                    </div>
                    <div className="mx-2 w-16 h-0.5 bg-gray-300"></div>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 2 ? "bg-red text-white" : "bg-gray-100 dark:bg-gray-600"}`}
                    >
                      2
                    </div>
                  </div>
                </div>

                {/* Step content */}
                {currentStep === 1 && (
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

                    <div className="max-h-80 overflow-y-auto">
                      {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                      ) : companies.length > 0 ? (
                        companies.map(company => (
                          <div
                            key={company.id}
                            onClick={() => handleSelectCompany(company)}
                            className="p-3 border-b hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium">{company.name}</p>
                              {company.business_registration_number && (
                                <p className="text-xs text-gray-500">
                                  Reg: {company.business_registration_number}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">No companies found</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Select Product */}
                {currentStep === 2 && selectedCompany && (
                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Selected Company:</p>
                      <p className="font-medium">{selectedCompany.name}</p>
                    </div>

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
                            className={`p-3 border rounded-lg mb-2 cursor-pointer ${selectedProduct?.id === product.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50 dark:hover:bg-gray-900"}`}
                          >
                            <p className="font-medium">{product.name}</p>
                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                              <span>SKU: {product.sku || "N/A"}</span>
                              <span>Carbon: {product.emission_total} kg</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">No products found</div>
                      )}
                    </div>

                    {selectedProduct && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
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
                )}

                {/* Footer with buttons */}
                <div className="flex justify-between mt-6 pt-4 border-t">
                  {currentStep === 2 ? (
                    <>
                      <Button onClick={() => setCurrentStep(1)} variant="outline">
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
                    <Button
                      onClick={() => setIsModalOpen(false)}
                      variant="outline"
                      className="ml-auto"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
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
      </>
    );
  }
);

BillOfMaterials.displayName = "BillOfMaterials";
export default BillOfMaterials;
