"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function EditProductPage({ params }: { params: { productId: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    manufacturer: "",
    category: "",
    weight: "",
    weight_unit: "kg",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  
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
        
        // Mock product data
        const mockProductData = {
          name: "Electronic Component A",
          sku: "EC-001",
          description: "High-quality electronic component for various applications",
          manufacturer: "Acme Corp",
          category: "Electronics",
          weight: "0.5",
          weight_unit: "kg",
        };
        
        setFormData(mockProductData);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyId) {
      setError("No company selected. Please select a company first.");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    setFieldErrors({});
    
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      // In a real app, this would make an API call
      // For now, we'll simulate a successful submission
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to product details page
      router.push(`/product-list/${params.productId}`);
    } catch (err) {
      console.error("Error updating product:", err);
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
        
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-gray-500 mt-1">Update product information</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 dark:bg-red-900/20 dark:border-red-900 dark:text-red-300">
          {error}
        </div>
      )}

      <Card className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.name[0]}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                SKU / Product ID *
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                required
                value={formData.sku}
                onChange={handleChange}
                className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
              />
              {fieldErrors.sku && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.sku[0]}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Manufacturer *
              </label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                required
                value={formData.manufacturer}
                onChange={handleChange}
                className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
              />
              {fieldErrors.manufacturer && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.manufacturer[0]}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
              />
              {fieldErrors.category && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.category[0]}</p>
              )}
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
                  value={formData.weight}
                  onChange={handleChange}
                  className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                />
                {fieldErrors.weight && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.weight[0]}</p>
                )}
              </div>
              
              <div className="w-28">
                <label htmlFor="weight_unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unit
                </label>
                <select
                  id="weight_unit"
                  name="weight_unit"
                  value={formData.weight_unit}
                  onChange={handleChange}
                  className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
              />
              {fieldErrors.description && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.description[0]}</p>
              )}
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
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}