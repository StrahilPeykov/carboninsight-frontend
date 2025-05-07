'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Link from "next/link";
import { carbonFootprintApi } from '../../lib/api/carbonFootprintApi';

export default function ManufacturingDataPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    self_assessment: '',
    product_type: '',
    annual_production: 0,
    production_unit: 'units',
    electricity_consumption: 0,
    electricity_renewable_percentage: 0,
    fuel_consumption: 0,
    fuel_type: 'diesel',
    water_consumption: 0,
    waste_production: 0,
    recycled_waste_percentage: 0,
    is_complete: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get the current assessment ID from localStorage
    const assessmentId = localStorage.getItem('currentAssessmentId');
    if (assessmentId) {
      setFormData(prev => ({ ...prev, self_assessment: assessmentId }));
    } else {
      // Redirect to self-assessment if no assessment ID is found
      router.push('/self-assessment');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await carbonFootprintApi.createManufacturingData(formData);
      router.push('/supply-chain-data');
    } catch (err) {
      setError('Failed to submit manufacturing data. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Manufacturing Data
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Step 2: Input data about your manufacturing processes
        </p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">Energy & Resource Consumption</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="product_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Primary Product Type
            </label>
            <input
              type="text"
              id="product_type"
              name="product_type"
              value={formData.product_type}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g. Electronic component, Automotive part"
            />
          </div>

          <div>
            <label htmlFor="annual_production" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Annual Production Quantity
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="number"
                id="annual_production"
                name="annual_production"
                value={formData.annual_production || ''}
                onChange={handleChange}
                required
                min="1"
                className="block w-full rounded-l-md border-gray-300 focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <select
                name="production_unit"
                value={formData.production_unit}
                onChange={handleChange}
                className="rounded-r-md border-l-0 border-gray-300 bg-gray-50 dark:bg-gray-600 dark:border-gray-600"
              >
                <option value="units">units</option>
                <option value="kg">kilograms</option>
                <option value="tons">metric tons</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="electricity_consumption" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Annual Electricity Consumption (kWh)
            </label>
            <input
              type="number"
              id="electricity_consumption"
              name="electricity_consumption"
              value={formData.electricity_consumption || ''}
              onChange={handleChange}
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="electricity_renewable_percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Percentage of Renewable Electricity (%)
            </label>
            <input
              type="number"
              id="electricity_renewable_percentage"
              name="electricity_renewable_percentage"
              value={formData.electricity_renewable_percentage || ''}
              onChange={handleChange}
              required
              min="0"
              max="100"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="fuel_consumption" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Annual Fuel Consumption (Liters/m³)
            </label>
            <input
              type="number"
              id="fuel_consumption"
              name="fuel_consumption"
              value={formData.fuel_consumption || ''}
              onChange={handleChange}
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="fuel_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fuel Type
            </label>
            <select
              id="fuel_type"
              name="fuel_type"
              value={formData.fuel_type}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="diesel">Diesel</option>
              <option value="natural_gas">Natural Gas</option>
              <option value="propane">Propane</option>
              <option value="coal">Coal</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="water_consumption" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Annual Water Consumption (m³)
            </label>
            <input
              type="number"
              id="water_consumption"
              name="water_consumption"
              value={formData.water_consumption || ''}
              onChange={handleChange}
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="waste_production" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Annual Waste Production (kg)
            </label>
            <input
              type="number"
              id="waste_production"
              name="waste_production"
              value={formData.waste_production || ''}
              onChange={handleChange}
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="recycled_waste_percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Percentage of Waste Recycled (%)
            </label>
            <input
              type="number"
              id="recycled_waste_percentage"
              name="recycled_waste_percentage"
              value={formData.recycled_waste_percentage || ''}
              onChange={handleChange}
              required
              min="0"
              max="100"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="flex justify-between pt-6">
            <Link href="/self-assessment">
              <Button variant="outline">Back to Self-Assessment</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Continue to Supply Chain'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}