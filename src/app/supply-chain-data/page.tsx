'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Link from "next/link";
import { carbonFootprintApi } from '../../lib/api/carbonFootprintApi';

interface Supplier {
  id: string;
  name: string;
  component: string;
  shares_co2_data: boolean;
  data_format: string;
  carbon_footprint?: number;
  carbon_footprint_unit?: string;
  use_estimates: boolean;
}

export default function SupplyChainPage() {
  const router = useRouter();
  const [hasSuppliers, setHasSuppliers] = useState<boolean | null>(null);
  const [selfAssessmentId, setSelfAssessmentId] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier>({
    id: '',
    name: '',
    component: '',
    shares_co2_data: false,
    data_format: 'none',
    use_estimates: false
  });
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get the current assessment ID from localStorage
    const assessmentId = localStorage.getItem('currentAssessmentId');
    if (assessmentId) {
      setSelfAssessmentId(assessmentId);
    } else {
      // Redirect to self-assessment if no assessment ID is found
      router.push('/self-assessment');
    }
  }, [router]);

  const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'shares_co2_data') {
      setCurrentSupplier({
        ...currentSupplier,
        shares_co2_data: (e.target as HTMLInputElement).checked
      });
    } else if (type === 'number') {
      setCurrentSupplier({
        ...currentSupplier,
        [name]: parseFloat(value) || 0
      });
    } else {
      setCurrentSupplier({
        ...currentSupplier,
        [name]: value
      });
    }
  };

  const addSupplier = () => {
    // Validate supplier data
    if (!currentSupplier.name || !currentSupplier.component) {
      setError('Please provide both supplier name and component');
      return;
    }

    // Generate a temporary client-side ID
    const newSupplier = {
      ...currentSupplier,
      id: Date.now().toString()
    };

    setSuppliers([...suppliers, newSupplier]);
    setIsAddingSupplier(false);
    setCurrentSupplier({
      id: '',
      name: '',
      component: '',
      shares_co2_data: false,
      data_format: 'none',
      use_estimates: false
    });
    setError('');
  };

  const removeSupplier = (id: string) => {
    setSuppliers(suppliers.filter(supplier => supplier.id !== id));
  };

  const handleSubmit = async () => {
    if (hasSuppliers === null) {
      setError('Please indicate whether you have suppliers');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      // First create the supply chain
      const supplyChainData = {
        self_assessment: selfAssessmentId,
        has_suppliers: hasSuppliers,
        is_complete: true
      };
      
      const supplyChain = await carbonFootprintApi.createSupplyChain(supplyChainData);
      
      // If we have suppliers, add them
      if (hasSuppliers && suppliers.length > 0) {
        const supplierPromises = suppliers.map(supplier => {
          const supplierData = {
            ...supplier,
            supply_chain: supplyChain.id
          };
          return carbonFootprintApi.addSupplier(supplierData);
        });
        
        await Promise.all(supplierPromises);
      }
      
      // Now we can calculate the carbon footprint
      try {
        await carbonFootprintApi.calculateFootprint(parseInt(selfAssessmentId));
      } catch (calcError) {
        console.error('Error calculating footprint:', calcError);
        // Continue even if calculation fails
      }
      
      // Redirect to results page
      router.push('/results');
    } catch (err) {
      setError('Failed to submit supply chain data. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Supply Chain Data
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Step 3: Add information about your suppliers and their carbon footprint
        </p>
      </div>

      <div className="space-y-10">
        <Card className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Do you have suppliers?</h2>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <button 
                className={`px-4 py-2 border-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  hasSuppliers === true 
                    ? 'border-green-500 text-green-600 bg-green-50 focus:ring-green-500' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
                onClick={() => setHasSuppliers(true)}
                type="button"
              >
                Yes
              </button>
              <button 
                className={`px-4 py-2 border-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  hasSuppliers === false 
                    ? 'border-green-500 text-green-600 bg-green-50 focus:ring-green-500' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
                onClick={() => setHasSuppliers(false)}
                type="button"
              >
                No
              </button>
            </div>
          </div>
        </Card>

        {hasSuppliers && (
          <Card className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Supplier Information</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAddingSupplier(true)}
                disabled={isAddingSupplier}
              >
                + Add Supplier
              </Button>
            </div>
            
            <div className="space-y-6">
              {suppliers.length > 0 ? (
                <>
                  {suppliers.map((supplier, index) => (
                    <div key={supplier.id} className="border border-gray-200 rounded-md p-4 dark:border-gray-700">
                      <div className="flex justify-between">
                        <h3 className="font-medium">Supplier #{index + 1}: {supplier.name}</h3>
                        <button 
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => removeSupplier(supplier.id)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <p><span className="font-medium">Component:</span> {supplier.component}</p>
                        <p>
                          <span className="font-medium">CO₂ Data:</span> 
                          {supplier.shares_co2_data ? 'Provides data' : 'No data available'}
                        </p>
                        {supplier.shares_co2_data && supplier.carbon_footprint && (
                          <p>
                            <span className="font-medium">Carbon Footprint:</span>
                            {supplier.carbon_footprint} {supplier.carbon_footprint_unit || 'kg CO₂e'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              ) : !isAddingSupplier ? (
                <p className="text-center text-gray-500 dark:text-gray-400">No suppliers added yet.</p>
              ) : null}
              
              {isAddingSupplier && (
                <div className="border border-gray-200 rounded-md p-4 dark:border-gray-700">
                  <h3 className="font-medium mb-4">Add New Supplier</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Supplier Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={currentSupplier.name}
                        onChange={handleSupplierChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                        placeholder="Supplier company name"
                      />
                    </div>

                    <div>
                      <label htmlFor="component" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Component/Material Supplied
                      </label>
                      <input
                        type="text"
                        id="component"
                        name="component"
                        value={currentSupplier.component}
                        onChange={handleSupplierChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                        placeholder="e.g. Electronic components, raw materials"
                      />
                    </div>

                    <div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="shares_co2_data"
                          name="shares_co2_data"
                          checked={currentSupplier.shares_co2_data}
                          onChange={handleSupplierChange}
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <label htmlFor="shares_co2_data" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          This supplier shares CO₂ data
                        </label>
                      </div>
                    </div>

                    {currentSupplier.shares_co2_data && (
                      <>
                        <div>
                          <label htmlFor="data_format" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            CO₂ Data Format
                          </label>
                          <select
                            id="data_format"
                            name="data_format"
                            value={currentSupplier.data_format}
                            onChange={handleSupplierChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                          >
                            <option value="dpp_aasx">Digital Product Passport (DPP in AASX format)</option>
                            <option value="other_digital">Other digital format</option>
                            <option value="manual">Manual data entry</option>
                            <option value="none">No data available (use estimates)</option>
                          </select>
                        </div>

                        {currentSupplier.data_format === 'manual' && (
                          <div>
                            <label htmlFor="carbon_footprint" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Carbon Footprint Value
                            </label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                              <input
                                type="number"
                                id="carbon_footprint"
                                name="carbon_footprint"
                                value={currentSupplier.carbon_footprint || ''}
                                onChange={handleSupplierChange}
                                min="0"
                                className="block w-full rounded-l-md border-gray-300 focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <select
                                name="carbon_footprint_unit"
                                value={currentSupplier.carbon_footprint_unit || 'kg CO2e'}
                                onChange={handleSupplierChange}
                                className="rounded-r-md border-l-0 border-gray-300 bg-gray-50 dark:bg-gray-600 dark:border-gray-600"
                              >
                                <option value="kg CO2e">kg CO₂e</option>
                                <option value="tons CO2e">tons CO₂e</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {!currentSupplier.shares_co2_data && (
                      <div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="use_estimates"
                            name="use_estimates"
                            checked={currentSupplier.use_estimates}
                            onChange={handleSupplierChange}
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <label htmlFor="use_estimates" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            Use default emission factors (estimate)
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3 mt-4">
                      <Button onClick={addSupplier} size="sm">
                        Add Supplier
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsAddingSupplier(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-6">
              <Link href="/manufacturing-data">
                <Button variant="outline">Back to Manufacturing Data</Button>
              </Link>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Calculating...' : 'Calculate Results'}
              </Button>
            </div>
          </Card>
        )}

        {hasSuppliers === false && (
          <div className="flex justify-between max-w-3xl mx-auto pt-6">
            <Link href="/manufacturing-data">
              <Button variant="outline">Back to Manufacturing Data</Button>
            </Link>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Calculating...' : 'Calculate Results'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}