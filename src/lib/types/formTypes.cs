/**
 * TypeScript interfaces for carbon footprint assessment form data
 * Defines type-safe structures for multi-step form data collection and processing
 */

// Interface for initial company assessment and basic information
export interface SelfAssessmentFormData {
  companyName: string;
  industrySector: string;
  employeeCount: string;
  location: string;
  annualRevenue?: string; // Optional revenue data
  hasEnvironmentalPolicy: boolean;
}

// Interface for manufacturing processes and resource consumption data
export interface ManufacturingFormData {
  productType: string;
  annualProduction: number; // Units produced per year
  electricityConsumption: number; // kWh consumed
  electricityRenewablePercentage: number; // Percentage from renewable sources
  fuelConsumption: number; // Fuel usage in liters/kg
  fuelType: string; // Type of fuel used (diesel, natural gas, etc.)
  waterConsumption: number; // Water usage in liters
  wasteProduction: number; // Waste generated in kg
  recycledWastePercentage: number; // Percentage of waste recycled
}

// Interface for individual supplier data and emission information
export interface SupplierData {
  id: string;
  name: string;
  component: string; // Component or material supplied
  sharesCO2Data: boolean; // Whether supplier provides emission data
  dataFormat?: string; // Format of shared data (CSV, XML, etc.)
  carbonFootprint?: number; // Emission value if available
  carbonFootprintUnit?: string; // Units for emission measurement
  useEstimates: boolean; // Whether to use estimated emission values
}

// Interface for supply chain information and supplier relationships
export interface SupplyChainFormData {
  hasSuppliers: boolean; // Whether company works with suppliers
  suppliers: SupplierData[]; // Array of supplier information
}

// Complete interface combining all assessment form sections
export interface CarbonFootprintFormData {
  selfAssessment: SelfAssessmentFormData;
  manufacturing: ManufacturingFormData;
  supplyChain: SupplyChainFormData;
}

// Interface for assessment results and calculated metrics
export interface ResultsData {
  totalCarbonFootprint: number; // Total CO2-equivalent emissions
  carbonIntensity: number; // Emissions per unit of output/revenue
  circularityIndex: number; // Circular economy performance score
  emissionsByCategory: {
    directOperations: number; // Scope 1: Direct emissions
    purchasedElectricity: number; // Scope 2: Indirect energy emissions
    supplyChain: number; // Scope 3: Value chain emissions
  };
  recommendations: {
    title: string;
    description: string;
    potentialReduction: number; // Estimated CO2-eq reduction potential
  }[];
}

// Type definition for form navigation steps
export type FormStep = 'selfAssessment' | 'manufacturing' | 'supplyChain' | 'results';
