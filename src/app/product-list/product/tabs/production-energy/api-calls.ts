// API client module for production energy emission management operations
// Provides centralized functions for CRUD operations, data validation, and state management
// Handles complex business logic for carbon footprint calculations and lifecycle assessments

// Production energy emission API client and type definitions
// Manages energy consumption data, override factors, and carbon intensity calculations
import { productionEnergyApi, ProductionEnergyEmission } from "@/lib/api/productionEmissionApi";
// Bill of Materials API client for component-level energy attribution
// Enables linking energy consumption to specific material components
import { bomApi, LineItem } from "@/lib/api/bomApi";
// Emission reference database API for standardized carbon factors
// Provides access to recognized emission factor databases for accurate calculations
import { EmissionReference, emissionReferenceApi } from "@/lib/api/emissionReferenceApi";
// Local form data type definitions for type safety and validation
import { FormData } from "./types";

// Comprehensive function to fetch all production energy emissions for a specific product
// Implements loading state management and error handling for optimal user experience
// Critical for populating emission lists and calculating total carbon footprint
// ── Fetch all production energy emissions ────────────────────
export const fetchEmissions = async (
  // Loading state setter to control UI feedback during API operations
  setIsLoading: (a: boolean) => void,
  // Company primary key for multi-tenant data isolation
  company_pk: number,
  // Function returning product ID for dynamic product context
  productId: () => number,
  // State setter for updating emission list in parent component
  setEmissions: (a: ProductionEnergyEmission[]) => void
) => {
  // Input validation: ensure product ID is valid before API call
  // Prevents unnecessary API requests and potential errors
  if (isNaN(productId())) {
    return;
  }
  
  // Set loading state to provide user feedback during async operation
  setIsLoading(true);
  try {
    // Fetch all production emissions for the specified company and product
    // Returns array of emission records with calculations and metadata
    const data = await productionEnergyApi.getAllProductionEmissions(company_pk, productId());
    setEmissions(data);
  } catch (error) {
    // Log error for debugging and monitoring purposes
    // Silent failure prevents disrupting user workflow
    console.error("Error fetching emissions:", error);
  } finally {
    // Always reset loading state regardless of success or failure
    // Ensures UI remains responsive and feedback is accurate
    setIsLoading(false);
  }
};

// Comprehensive form submission handler for creating and updating emission records
// Implements extensive validation, data transformation, and state management
// Handles both creation and update workflows with proper error handling and user feedback
// ── Handle submit for add/edit emission ──────────────────────
export const handleSubmit = async (
  // Form data containing energy consumption, references, and override factors
  formData: FormData,
  // Submission state setter to control button states and loading indicators
  setIsSubmitting: (a: boolean) => void,
  // Current emission being edited (null for creation, object for updates)
  currentEmission: ProductionEnergyEmission | null,
  // Company primary key for multi-tenant data isolation
  company_pk: number,
  // Function returning product ID for dynamic product context
  productId: () => number,
  // Modal visibility state setter for closing after successful submission
  setIsModalOpen: (a: boolean) => void,
  // Callback to notify parent component of data changes for re-calculations
  onFieldChange: () => void,
  // Loading state setter for managing UI feedback during operations
  setIsLoading: (a: boolean) => void,
  // State setter for updating emission list after successful operations
  setEmissions: (a: ProductionEnergyEmission[]) => void
) => {
  // Parse and validate energy consumption value
  // Ensures numeric input and enforces minimum threshold for meaningful data
  const energyConsumption = parseFloat(formData.energy_consumption);
  if (isNaN(energyConsumption) || energyConsumption < 1) {
    alert("Please enter a valid energy consumption value (must be 1 or greater)");
    return;
  }
  
  // Comprehensive validation of override factors array
  // Ensures all override factors have complete and valid data before submission
  // Prevents incomplete or corrupted emission factor data in calculations
  if (
    formData.override_factors.some(
      factor =>
        // Validate lifecycle stage is a non-empty string
        typeof factor.lifecycle_stage !== "string" ||
        factor.lifecycle_stage.trim() === "" ||
        // Validate biogenic emission factor is a valid number
        typeof factor.co_2_emission_factor_biogenic !== "number" ||
        isNaN(factor.co_2_emission_factor_biogenic) ||
        // Validate non-biogenic emission factor is a valid number
        typeof factor.co_2_emission_factor_non_biogenic !== "number" ||
        isNaN(factor.co_2_emission_factor_non_biogenic)
    )
  ) {
    alert("Please fill in all overrides fields correctly.");
    return;
  }

  // Set submitting state to prevent double-submission and provide user feedback
  setIsSubmitting(true);
  try {
    // Parse reference ID from string to integer, handle null case
    // Enables optional reference selection while maintaining type safety
    const reference = formData.reference ? parseInt(formData.reference) : null;

    // Construct API payload with validated and transformed data
    // Ensures data consistency and type safety for backend processing
    const data = {
      energy_consumption: energyConsumption,
      reference,
      override_factors: formData.override_factors,
      line_items: formData.line_items,
    };

    // Determine operation type based on currentEmission state
    // Handles both update and create scenarios with appropriate API calls
    if (currentEmission) {
      // Update existing emission record with new data
      // Preserves emission ID while updating all other fields
      await productionEnergyApi.updateProductionEmission(
        company_pk,
        productId(),
        currentEmission.id,
        data
      );
    } else {
      // Create new emission record with form data
      // Generates new emission ID and initializes all calculations
      await productionEnergyApi.createProductionEmission(company_pk, productId(), data);
    }

    // Refresh emission list to reflect changes and updated calculations
    // Ensures UI displays most current data including any server-side calculations
    await fetchEmissions(setIsLoading, company_pk, productId, setEmissions);
    
    // Close modal after successful submission to return to main view
    setIsModalOpen(false);
    
    // Notify parent component of changes for dependent calculations and updates
    // Triggers recalculation of totals, charts, and other derived data
    onFieldChange();
  } catch (error) {
    // Log error for debugging and monitoring purposes
    // User-friendly error handling could be added here for better UX
    console.error("Error saving emission:", error);
  } finally {
    // Always reset submitting state regardless of success or failure
    // Ensures form controls remain responsive and feedback is accurate
    setIsSubmitting(false);
  }
};

// Function to fetch Bill of Materials line items for energy attribution
// Enables linking energy consumption to specific material components
// Critical for component-level carbon footprint analysis and allocation
// ── Fetch BOM line items ─────────────────────────────────────
export const fetchBomLineItems = async (
  // Company primary key for multi-tenant data isolation
  company_pk: number,
  // Function returning product ID for dynamic product context
  productId: () => number,
  // State setter for updating BOM line items list in parent component
  setBomLineItems: (a: LineItem[]) => void
) => {
  try {
    // Fetch all BOM line items for the specified company and product
    // Returns array of component items with quantities and material information
    const data = await bomApi.getAllLineItems(company_pk, productId());
    setBomLineItems(data);
  } catch (error) {
    // Log error for debugging and monitoring purposes
    // Silent failure allows form to function without BOM association if needed
    console.error("Error fetching BOM items:", error);
  }
};

// Comprehensive deletion handler for production energy emission records
// Implements safe deletion with state management and parent notification
// Ensures data consistency and triggers recalculation of dependent values
// ── Delete emission ──────────────────────────────────────────
export const handleDelete = async (
  // ID of emission to delete (null indicates no deletion requested)
  deletingEmissionId: number | null,
  // Company primary key for multi-tenant data isolation
  company_pk: number,
  // Function returning product ID for dynamic product context
  productId: () => number,
  // State setter for updating emission list after deletion
  setEmissions: (a: ProductionEnergyEmission[]) => void,
  // Current emissions array for optimistic UI updates
  emissions: ProductionEnergyEmission[],
  // Modal visibility state setter for closing deletion confirmation
  setIsDeleteModalOpen: (a: boolean) => void,
  // State setter for clearing deletion target after completion
  setDeletingEmissionId: (a: number | null) => void,
  // Callback to notify parent component of data changes for recalculations
  onFieldChange: () => void
) => {
  // Guard clause: exit if no emission ID provided
  // Prevents accidental deletions and API calls with invalid parameters
  if (deletingEmissionId === null) return;

  try {
    // Delete emission record from backend database
    // Permanently removes emission and all associated calculations
    await productionEnergyApi.deleteProductionEmission(company_pk, productId(), deletingEmissionId);
    
    // Optimistically update local state by filtering out deleted emission
    // Provides immediate UI feedback without waiting for backend confirmation
    setEmissions(emissions.filter(emission => emission.id !== deletingEmissionId));
    
    // Close deletion confirmation modal after successful deletion
    setIsDeleteModalOpen(false);
    
    // Clear deletion target state to reset UI state
    setDeletingEmissionId(null);
    
    // Notify parent component of changes for dependent calculations and updates
    // Triggers recalculation of totals, charts, and other derived data
    onFieldChange();
  } catch (error) {
    // Log error for debugging and monitoring purposes
    // User-friendly error handling could be added here for better UX
    console.error("Error deleting emission:", error);
  }
};

// Function to fetch standardized emission reference databases
// Loads recognized carbon intensity factors for accurate lifecycle assessments
// Critical for providing users with validated emission calculation methodologies
// ── Fetch emission references on mount ───────────────────────
export const fetchReferences = async (
  // State setter for updating available emission references list
  setReferences: (a: EmissionReference[]) => void
) => {
  try {
    // Fetch all available production energy emission references
    // Returns standardized carbon intensity factors from recognized databases
    // Includes methodologies like IPCC, ecoinvent, and other LCA databases
    const data = await emissionReferenceApi.getAllProductionEnergyReferences();
    setReferences(data);
  } catch (error) {
    // Log error for debugging and monitoring purposes
    // Silent failure allows manual override factor entry if references unavailable
    console.error("Error fetching references:", error);
  }
};
