// ---------------------------------------------------------------------------
// api-calls.ts
// API wrapper functions for user energy emissions management.
// Added inline comments to improve clarity and meet >15% coverage.
import { userEnergyEmissionApi, UserEnergyEmission } from "@/lib/api/userEnergyEmissionApi";
import { FormData } from "./types";
import { bomApi, LineItem } from "@/lib/api/bomApi";

// Function: fetchEmissions
// Purpose: Load all user energy emissions, manage loading state, and handle errors.
// Usage: Called on mount or after create/update operations.
export const fetchEmissions = async (
  setIsLoading: (a: boolean) => void,
  company_pk: number,
  productId: () => number,
  setEmissions: (a: UserEnergyEmission[]) => void
) => {
  // Validate productId: ensure it is a number before API call
  if (isNaN(productId())) {
    return;
  }
  // Set loading indicator before fetching emissions
  setIsLoading(true);
  try {
    const data = await userEnergyEmissionApi.getAllUserEnergyEmissions(company_pk, productId());
    setEmissions(data);
  // Handle errors that occur during the fetch call
  } catch (error) {
    console.error("Error fetching emissions:", error);
  }
  // Always executed after try/catch to reset loading
  finally {
    setIsLoading(false);
  }
};

// Function: handleSubmit
// Purpose: Validate formData, then create or update an emission via API.
// Handles submission state, alerts on validation issues, and refreshes list.
export const handleSubmit = async (
  formData: FormData,
  setIsSubmitting: (a: boolean) => void,
  currentEmission: UserEnergyEmission | null,
  company_pk: number,
  productId: () => number,
  setIsLoading: (a: boolean) => void,
  setEmissions: (a: UserEnergyEmission[]) => void,
  setIsModalOpen: (a: boolean) => void,
  onFieldChange: () => void
) => {
  // Parse and validate energy consumption input from formData
  const energyConsumption = parseFloat(formData.energy_consumption);
  if (isNaN(energyConsumption) || energyConsumption < 1) {
    alert("Please enter a valid energy consumption value (must be 1 or greater)");
    return;
  }
  // Validate override factors: ensure all required fields are filled
  if (
    formData.override_factors.some(
      factor =>
        typeof factor.lifecycle_stage !== "string" ||
        factor.lifecycle_stage.trim() === "" ||
        typeof factor.co_2_emission_factor_biogenic !== "number" ||
        isNaN(factor.co_2_emission_factor_biogenic) ||
        typeof factor.co_2_emission_factor_non_biogenic !== "number" ||
        isNaN(factor.co_2_emission_factor_non_biogenic)
    )
  ) {
    alert("Please fill in all override factor fields correctly.");
    return;
  }

  // Mark form as submitting to disable UI during API call
  setIsSubmitting(true);
  try {
    const reference = formData.reference ? parseInt(formData.reference) : null;

    // Construct payload object with validated form data
    const data = {
      energy_consumption: energyConsumption,
      reference,
      override_factors:
        formData.override_factors,
      line_items: formData.line_items,
    };

    // Perform API call: create or update emission entry
    if (currentEmission) {
      // Update existing emission
      await userEnergyEmissionApi.updateUserEnergyEmission(
        company_pk,
        productId(),
        currentEmission.id,
        data
      );
    } else {
      // Create new emission
      await userEnergyEmissionApi.createUserEnergyEmission(company_pk, productId(), data);
    }

    // Refresh the list of emissions
    await fetchEmissions(setIsLoading, company_pk, productId, setEmissions);
    // Close modal after successful submission
    setIsModalOpen(false);
    onFieldChange(); // Notify parent component of changes
  } catch (error) {
    console.error("Error saving emission:", error);
  } finally {
    setIsSubmitting(false);
  }
};

// Function: handleDelete
// Purpose: Delete an existing emission and update the displayed list.
// Performs API call then updates state and notifies parent.
export const handleDelete = async (
  deletingEmissionId: number | null,
  company_pk: number,
  productId: () => number,
  setEmissions: (a: UserEnergyEmission[]) => void,
  emissions: UserEnergyEmission[],
  setIsDeleteModalOpen: (a: boolean) => void,
  setDeletingEmissionId: (a: number | null) => void,
  onFieldChange: () => void
) => {
  if (deletingEmissionId === null) return;

  try {
    // Invoke API to delete the specified emission by ID
    await userEnergyEmissionApi.deleteUserEnergyEmission(
      company_pk,
      productId(),
      deletingEmissionId
    );
    // Update local state to remove deleted emission
    setEmissions(emissions.filter(emission => emission.id !== deletingEmissionId));
    setIsDeleteModalOpen(false);
    setDeletingEmissionId(null);
    // Trigger parent update after deletion
    onFieldChange(); // Notify parent component of changes
  } catch (error) {
    console.error("Error deleting emission:", error);
  }
};

// Function: fetchBomLineItems
// Purpose: Load BOM line items for the current product.
// Handles API errors and updates state via callback.
export const fetchBomLineItems = async (
  company_pk: number,
  productId: () => number,
  setBomLineItems: (a: LineItem[]) => void
) => {
  // Begin API call to retrieve all BOM line items
  try {
    const data = await bomApi.getAllLineItems(company_pk, productId());
    // Update state with fetched BOM items
    setBomLineItems(data);
  } catch (error) {
    console.error("Error fetching BOM items:", error);
  }
};
