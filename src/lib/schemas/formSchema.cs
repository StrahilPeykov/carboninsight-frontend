/**
 * Zod validation schemas for carbon footprint assessment forms
 * Provides type-safe validation for multi-step form data collection
 */

import { z } from 'zod';

// Schema for initial company self-assessment data
export const selfAssessmentSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  industrySector: z.string().min(1, 'Industry sector is required'),
  employeeCount: z.string().min(1, 'Employee count is required'),
  location: z.string().min(1, 'Location is required'),
  annualRevenue: z.string().optional(), // Optional revenue information
  hasEnvironmentalPolicy: z.boolean().default(false),
});

// Schema for manufacturing process and consumption data
export const manufacturingSchema = z.object({
  productType: z.string().min(1, 'Product type is required'),
  annualProduction: z.number().min(1, 'Annual production must be greater than 0'),
  electricityConsumption: z.number().min(0, 'Electricity consumption cannot be negative'),
  electricityRenewablePercentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
  fuelConsumption: z.number().min(0, 'Fuel consumption cannot be negative'),
  fuelType: z.string().min(1, 'Fuel type is required'),
  waterConsumption: z.number().min(0, 'Water consumption cannot be negative'),
  wasteProduction: z.number().min(0, 'Waste production cannot be negative'),
  recycledWastePercentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
});

// Schema for individual supplier information
export const supplierSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Supplier name is required'),
  component: z.string().min(1, 'Component/material is required'),
  sharesCO2Data: z.boolean(), // Whether supplier provides emission data
  dataFormat: z.string().optional(), // Format of shared data (if any)
  carbonFootprint: z.number().optional(), // Actual emission values
  carbonFootprintUnit: z.string().optional(), // Units for emission values
  useEstimates: z.boolean().default(false), // Whether to use estimated values
});

// Schema for supply chain information and supplier relationships
export const supplyChainSchema = z.object({
  hasSuppliers: z.boolean(),
  suppliers: z.array(supplierSchema).default([]), // Array of supplier data
});

// Complete schema combining all assessment sections
export const carbonFootprintSchema = z.object({
  selfAssessment: selfAssessmentSchema,
  manufacturing: manufacturingSchema,
  supplyChain: supplyChainSchema,
});

// Schema for calculation results and recommendations
export const resultsSchema = z.object({
  totalCarbonFootprint: z.number(), // Total CO2-eq emissions
  carbonIntensity: z.number(), // Emissions per unit of product/revenue
  circularityIndex: z.number(), // Measure of circular economy practices
  emissionsByCategory: z.object({
    directOperations: z.number(), // Scope 1 emissions
    purchasedElectricity: z.number(), // Scope 2 emissions
    supplyChain: z.number(), // Scope 3 emissions
  }),
  recommendations: z.array(z.object({
    title: z.string(),
    description: z.string(),
    potentialReduction: z.number(), // Estimated emission reduction potential
  })),
});
