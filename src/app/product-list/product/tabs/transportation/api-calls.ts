// Import necessary API clients and type definitions for transportation emissions
import {
  CreateTransportEmission,
  TransportEmission,
  transportEmissionApi,
} from "@/lib/api/transportEmissionApi";
// Import BOM (Bill of Materials) API for fetching line items
import { bomApi, LineItem } from "@/lib/api/bomApi";
// Import lifecycle stage choices for emission calculations
import { LifecycleStageChoice } from "@/lib/api";
// Import emission reference data for standardized emission factors
import { EmissionReference, emissionReferenceApi } from "@/lib/api/emissionReferenceApi";
// Import local form data types
import { FormData } from "./types";

// Fetch all transport emissions for a specific product
// This function retrieves all emissions data from the backend API
export const fetchEmissions = async (
  // Function to update loading state in UI
  setIsLoading: (a: boolean) => void,
  // Company primary key for API access control
  company_pk: number,
  // Function that returns the current product ID
  productId: () => number,
  // State setter for emissions data
  setEmissions: (a: TransportEmission[]) => void
) => {
  // Validate product ID before making API call
  if (isNaN(productId())) {
    return; // Exit early if product ID is invalid
  }
  
  // Set loading state to true before API call
  setIsLoading(true);
  
  try {
    // Call the API to get all transport emissions for this product
    const data = await transportEmissionApi.getAllTransportEmissions(company_pk, productId());
    // Update state with fetched emissions data
    setEmissions(data);
  } catch (error) {
    // Log any errors to console for debugging
    console.error("Error fetching transport emissions:", error);
  } finally {
    // Always set loading to false when done, even if there was an error
    setIsLoading(false);
  }
};

// Fetch BOM line items for the current product
// These items can be associated with transport emissions
export const fetchBomLineItems = async (
  // Company identifier
  company_pk: number,
  // Function to get current product ID
  productId: () => number,
  // State setter for BOM items
  setBomLineItems: (a: LineItem[]) => void
) => {
  try {
    // Retrieve all line items for this product from the BOM API
    const data = await bomApi.getAllLineItems(company_pk, productId());
    // Update component state with fetched line items
    setBomLineItems(data);
  } catch (error) {
    // Log errors to console for debugging purposes
    console.error("Error fetching BOM items:", error);
  }
};

// Fetch lifecycle stage choices for emission overrides
// These choices determine which lifecycle stages can be selected for custom emission factors
export const fetchLifecycleChoices = async (
  // Company identifier for API access
  company_pk: number,
  // Function to get product ID
  productId: () => number, 
  // State setter for choices
  setLifecycleChoices: (a: LifecycleStageChoice[]) => void
) => {
  try {
    // Make API call to get schema options including available lifecycle stages
    // The schema response contains metadata about available choices for fields
    const schema = (await transportEmissionApi.getTransportEmissionOptions(
      company_pk,
      productId()
    )) as {
      actions: {
        POST: {
          override_factors?: {
            child?: {
              children?: {
                lifecycle_stage?: {
                  choices: { value: string; display_name: string }[];
                };
              };
            };
          };
        };
      };
    };
    
    // Extract choices from the nested schema response
    // Uses optional chaining (?.) to safely navigate the complex response structure
    // Falls back to empty array if any part of the path is undefined
    const choices =
      schema.actions.POST.override_factors?.child?.children?.lifecycle_stage?.choices ?? [];
    // Update component state with the available lifecycle stage choices
    setLifecycleChoices(choices);
  } catch (error) {
    // Log API errors to console
    console.error("Error fetching lifecycle stage choices:", error);
  }
};

// Fetch reference emission factors for transportation
// These are standardized factors that can be used for emissions calculations
export const fetchReferences = async (setReferences: (a: EmissionReference[]) => void) => {
  try {
    // Call API to get all transportation reference data
    const data = await emissionReferenceApi.getAllTransportReferences();
    // Update state with reference data
    setReferences(data);
  } catch (error) {
    // Log any API errors
    console.error("Error fetching transport references:", error);
  }
};

// Submit form data to create or update a transport emission
// Handles both creation of new emissions and updates to existing ones
export const handleSubmit = async (
  // Form data containing all emission details
  formData: FormData,
  // Function to update submission status
  setIsSubmitting: (a: boolean) => void,
  // Current emission being edited (null for new)
  currentEmission: TransportEmission | null,
  // Company identifier
  company_pk: number,
  // Function to get product ID
  productId: () => number,
  // Function to update loading state
  setIsLoading: (a: boolean) => void,
  // Function to update emissions list
  setEmissions: (a: TransportEmission[]) => void,
  // Function to control modal visibility
  setIsModalOpen: (a: boolean) => void,
  // Callback for form changes
  onFieldChange: (field?: string, value?: any, meta?: any) => void
) => {
  // Parse and validate distance input
  const distanceNum = parseFloat(formData.distance);
  // Parse and validate weight input
  const weightNum = parseFloat(formData.weight);
  
  // Validate distance - must be a positive number
  if (isNaN(distanceNum) || distanceNum <= 0) {
    alert("Please enter a valid distance (greater than 0).");
    // Exit early if validation fails
    return;
  }
  
  // Validate weight - must be a positive number
  if (isNaN(weightNum) || weightNum <= 0) {
    alert("Please enter a valid weight (greater than 0).");
    // Exit early if validation fails
    return;
  }
  
  // Validate all override factors have required fields with valid values
  if (
    formData.override_factors.some(
      factor =>
        // Must have lifecycle stage
        !factor.lifecycle_stage ||
        // Biogenic factor must be number
        typeof factor.co_2_emission_factor_biogenic !== "number" ||
        // Biogenic factor must not be NaN
        isNaN(factor.co_2_emission_factor_biogenic) ||
        // Non-biogenic factor must be number
        typeof factor.co_2_emission_factor_non_biogenic !== "number" ||
        // Non-biogenic factor must not be NaN
        isNaN(factor.co_2_emission_factor_non_biogenic)
    )
  ) {
    alert("Please fill in all override fields correctly.");
    // Exit if any override is invalid
    return; 
  }

  // Set submitting state to show loading indicator
  setIsSubmitting(true);
  
  try {
    // Parse reference ID from string to number
    // Default to 0 if no reference selected
    const referenceId = formData.reference ? parseInt(formData.reference, 10) : 0;
    
    // Prepare base payload for API with all required fields
    const payloadBase = {
      // Validated distance
      distance: distanceNum,
      // Validated weight
      weight: weightNum,
      // Reference ID for emission factors
      reference: referenceId,
      // Map override factors to correct format, preserving IDs for existing factors
      override_factors: formData.override_factors.map(f =>
        f.id
          ? { // For existing factors, include ID
              id: f.id,
              lifecycle_stage: f.lifecycle_stage,
              co_2_emission_factor_biogenic: f.co_2_emission_factor_biogenic,
              co_2_emission_factor_non_biogenic: f.co_2_emission_factor_non_biogenic,
            }
          : { // For new factors, omit ID field
              lifecycle_stage: f.lifecycle_stage,
              co_2_emission_factor_biogenic: f.co_2_emission_factor_biogenic,
              co_2_emission_factor_non_biogenic: f.co_2_emission_factor_non_biogenic,
            }
      ),
      // Only include line_items if there are any selected
      line_items: formData.line_items.length ? formData.line_items : undefined,
    } as CreateTransportEmission & { override_factors: any[]; line_items?: number[] };

    // Check if we're updating an existing emission or creating a new one
    if (currentEmission) {
      // Update existing emission with PUT request
      await transportEmissionApi.updateTransportEmission(
        company_pk,
        productId(),
        currentEmission.id,
        payloadBase
      );
    } else {
      // Create new emission with POST request
      await transportEmissionApi.createTransportEmission(company_pk, productId(), payloadBase);
    }

    // After successful API call, refresh the emissions list
    await fetchEmissions(setIsLoading, company_pk, productId, setEmissions);
    // Close the modal after successful submission
    setIsModalOpen(false);
    // Notify parent component that transport emissions have changed
    onFieldChange('transport_emissions', null);
  } catch (error) {
    // Log API errors to console
    console.error("Error saving transport emission:", error);
  } finally {
    // Always reset submitting state when done
    setIsSubmitting(false);
  }
};

// Handle deletion of a transport emission
export const handleDelete = async (
  deletingEmissionId: number | null,
  company_pk: number,
  productId: () => number,
  setEmissions: (a: TransportEmission[]) => void, 
  emissions: TransportEmission[],
  setIsDeleteModalOpen: (a: boolean) => void,
  onFieldChange: (field?: string, value?: any, meta?: any) => void,
  setIsDeleting: (a: boolean) => void
) => {
  // Validate emission ID before proceeding
  if (deletingEmissionId === null) return;
  
  try {
    // Set deleting state to true to show loading state
    setIsDeleting(true);
    
    // Call API to delete the emission
    await transportEmissionApi.deleteTransportEmission(company_pk, productId(), deletingEmissionId);
    
    // Update the UI by removing the emission from state
    setEmissions(emissions.filter(e => e.id !== deletingEmissionId));
    
    // Notify parent component that transport emissions have changed
    onFieldChange('transport_emissions', null);
    
    // Close the modal after successful deletion
    setIsDeleteModalOpen(false);
  } catch (error) {
    // Log deletion errors to console
    console.error("Error deleting transport emission:", error);
    
    // Don't show alert, just log the error
    // The modal will stay open so the user can try again
  } finally {
    // Always reset deleting state when done, even if there was an error
    setIsDeleting(false);
  }
};