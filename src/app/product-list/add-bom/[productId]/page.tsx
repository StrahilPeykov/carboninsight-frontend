"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/PopupModal";
import { ArrowLeft, Plus, Search, Building2, CheckCircle, Calculator } from "lucide-react";

interface SupplierProductOption {
  id: string;
  name: string;
  sku: string;
  manufacturer: string;
  carbon_footprint: number | null;
  carbon_footprint_unit: string;
}

interface SelfEstimatedFormData {
  name: string;
  weight: string;
  weight_unit: string;
  material: string;
  co2_emission_override: string;
}

export default function AddBomPage({ params }: { params: { productId: string } }) {
  const router = useRouter();
  
  // State for main product
  const [productName, setProductName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State for supplier product selection
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SupplierProductOption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SupplierProductOption | null>(null);
  
  // State for quantity
  const [quantity, setQuantity] = useState<string>("1");
  const [quantityUnit, setQuantityUnit] = useState<string>("pcs");
  
  // State for self-estimated product
  const [isSelfEstimating, setIsSelfEstimating] = useState(false);
  const [selfEstimatedForm, setSelfEstimatedForm] = useState<SelfEstimatedFormData>({
    name: "",
    weight: "",
    weight_unit: "kg",
    material: "",
    co2_emission_override: "",
  });
  
  // State for emissions
  const [transportEmission, setTransportEmission] = useState<string>("");
  const [manufacturingEmission, setManufacturingEmission] = useState<string>("");
  
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // API URL from environment variables with fallback
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  
  // Get the company ID from localStorage
  const companyId = localStorage.getItem("selected_company_id");

  useEffect(() => {
    if (!companyId) {
      setError("No company selected. Please select a company first.");
      setIsLoading(false);
      return;
    }
    
    if (!params.productId) {
      setError("No product selected. Please select a product first.");
      setIsLoading(false);
      return;
    }
    
    // Fetch product data
    const fetchProductData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        // In a real app, this would make an API call
        // For now, we'll use mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock product data - just name for now
        setProductName("Electronic Component A");
      } catch (err) {
        console.error("Error fetching product:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductData();
  }, [companyId, params.productId, router]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      // In a real app, this would make an API call
      // For now, we'll use mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock search results
      const mockResults: SupplierProductOption[] = [
        {
          id: "1",
          name: "Resistor Pack",
          sku: "RP-100",
          manufacturer: "Component Suppliers SA",
          carbon_footprint: 0.8,
          carbon_footprint_unit: "kg CO2e",
        },
        {
          id: "2",
          name: "PCB Board",
          sku: "PCB-100",
          manufacturer: "Circuit Co",
          carbon_footprint: 3.5,
          carbon_footprint_unit: "kg CO2e",
        },
        {
          id: "3",
          name: "Display Module",
          sku: "DM-200",
          manufacturer: "Electronic Components Co",
          carbon_footprint: null,
          carbon_footprint_unit: "kg CO2e",
        }
      ];
      
      setSearchResults(mockResults);
    } catch (err) {
      console.error("Error searching products:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelfEstimatedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelfEstimatedForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyId) {
      setError("No company selected. Please select a company first.");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      // In a real app, this would make an API call to add the BoM item
      // For now, we'll simulate a successful submission
      
      // Validate that we have either a selected product or self-estimated data
      if (!selectedProduct && !isSelfEstimating) {
        setError("Please select a supplier product or add a self-estimated product");
        setIsSubmitting(false);
        return;
      }
      
      if (isSelfEstimating) {
        // Validate self-estimated form
        if (!selfEstimatedForm.name || !selfEstimatedForm.material) {
          setError("Please fill in all required fields for the self-estimated product");
          setIsSubmitting(false);
          return;
        }
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to product details page
      router.push(`/product-list/${params.productId}`);
    } catch (err) {
      console.error("Error adding BoM item:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading product data...</p>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link href={`/product-list/${params.productId}`} className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to Product Details</span>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold">Add Component to Bill of Materials</h1>
        <p className="text-gray-500 mt-1">
          Add a component to the bill of materials for <span className="font-medium">{productName}</span>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 dark:bg-red-900/20 dark:border-red-900 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Supplier product search */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Search for Supplier Product</h2>
            
            <div className="mb-4">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by product name or SKU..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="p-2 pl-10 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
            
            {isSearching ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Searching for products...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="border border-gray-200 rounded-md divide-y divide-gray-200 dark:border-gray-700 dark:divide-gray-700 mb-4">
                {searchResults.map(product => (
                  <div 
                    key={product.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 
                      ${selectedProduct?.id === product.id ? 'bg-gray-100 dark:bg-gray-800' : ''}
                    `}
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsSelfEstimating(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="font-medium">{product.manufacturer}</span>
                        </div>
                        <h3 className="text-lg font-medium mt-1">{product.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
                        
                        {product.carbon_footprint !== null ? (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            Carbon Footprint: {product.carbon_footprint} {product.carbon_footprint_unit}
                          </p>
                        ) : (
                          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                            Carbon Footprint: Not available
                          </p>
                        )}
                      </div>
                      {selectedProduct?.id === product.id && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery && (
              <div className="text-center py-4 mb-4">
                <p className="text-gray-500 dark:text-gray-400">No products found matching your search</p>
              </div>
            )}
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => {
                setIsSelfEstimating(true);
                setSelectedProduct(null);
              }}
            >
              <Plus size={16} />
              <span>Add Self-Estimated Product</span>
            </Button>
          </Card>
          
          {/* Self-estimated product form */}
          {isSelfEstimating && (
            <Card className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Self-Estimated Product</h2>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Component Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={selfEstimatedForm.name}
                    onChange={handleSelfEstimatedChange}
                    className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label htmlFor="material" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Material Type *
                  </label>
                  <input
                    type="text"
                    id="material"
                    name="material"
                    required
                    value={selfEstimatedForm.material}
                    onChange={handleSelfEstimatedChange}
                    className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="e.g. Steel, Plastic, Aluminum"
                  />
                </div>
                
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Weight
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      id="weight"
                      name="weight"
                      value={selfEstimatedForm.weight}
                      onChange={handleSelfEstimatedChange}
                      className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  
                  <div className="w-28">
                    <label htmlFor="weight_unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Unit
                    </label>
                    <select
                      id="weight_unit"
                      name="weight_unit"
                      value={selfEstimatedForm.weight_unit}
                      onChange={handleSelfEstimatedChange}
                      className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                    </select>
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="co2_emission_override" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Carbon Emission Estimate (kg CO2e)
                  </label>
                  <div className="flex items-center mt-1">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      id="co2_emission_override"
                      name="co2_emission_override"
                      value={selfEstimatedForm.co2_emission_override}
                      onChange={handleSelfEstimatedChange}
                      className="p-2 block w-full rounded-l-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Enter value or leave blank for automatic calculation"
                    />
                    <Button 
                      type="button"
                      className="rounded-l-none"
                      onClick={() => {
                        // In a real app, this would calculate based on material and weight
                        const weight = parseFloat(selfEstimatedForm.weight) || 0;
                        // Simple mock calculation based on weight
                        if (weight > 0) {
                          const estimatedCO2 = (weight * 2.5).toFixed(2);
                          setSelfEstimatedForm(prev => ({
                            ...prev,
                            co2_emission_override: estimatedCO2,
                          }));
                        }
                      }}
                    >
                      <Calculator size={16} className="mr-1" />
                      <span>Estimate</span>
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Leave blank to use default emission factors based on material and weight
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
        
        {/* Right column - Quantity and transport/manufacturing emissions */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Component Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantity *
                </label>
                <div className="flex space-x-2 mt-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    id="quantity"
                    required
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <select
                    value={quantityUnit}
                    onChange={e => setQuantityUnit(e.target.value)}
                    className="p-2 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="m">m</option>
                    <option value="l">l</option>
                  </select>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Additional Emissions</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="transportEmission" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Transport Emissions (kg CO2e)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      id="transportEmission"
                      value={transportEmission}
                      onChange={e => setTransportEmission(e.target.value)}
                      className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Optional"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="manufacturingEmission" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Manufacturing Emissions (kg CO2e)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      id="manufacturingEmission"
                      value={manufacturingEmission}
                      onChange={e => setManufacturingEmission(e.target.value)}
                      className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-5 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-end space-x-3">
                  <Link href={`/product-list/${params.productId}`}>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isSubmitting || (!selectedProduct && !isSelfEstimating)}
                  >
                    {isSubmitting ? "Adding Component..." : "Add Component"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}