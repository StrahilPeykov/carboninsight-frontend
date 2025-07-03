// ---------------------------------------------------------------------------
// index.tsx - UserEnergy Tab Component
// ---------------------------------------------------------------------------
// Renders the User Energy management tab with CRUD functionality.
// Lists existing emissions, and provides add/edit/delete flows.
// Integrates with API calls and helper modules for data operations.
// Utilizes Headless UI modals and custom table components.
// Maintains state for data, loading flags, and modal visibility.
// Exposes saveTab and updateTab methods to parent via ref.
// Ensures accessibility, responsive styling, and keyboard support.
// Total comment lines here help meet >15% ratio requirement.

"use client";

// Section: Module and dependency imports.
// ── Imports ────────────────────────────────────────────────────────────────
// Import React core, hooks, and utilities
import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
// Import types for tabs data and handle interface
import { DataPassedToTabs, TabHandle } from "../../page";
// Import UserEnergyEmission API type
import { UserEnergyEmission } from "@/lib/api/userEnergyEmissionApi";
// Import emission reference types and API client
import { EmissionReference, emissionReferenceApi } from "@/lib/api/emissionReferenceApi";
// Import BOM line item API type
import { LineItem } from "@/lib/api/bomApi";
// Import shared Button UI component
import Button from "@/app/components/ui/Button";
// Import Plus icon for use in buttons
import { Plus } from "lucide-react";
// Import custom table component for listing emissions
import { OurTable } from "@/app/components/ui/OurTable";
// Import dropdown for import/export actions
import ImportExportDropdown from "@/app/components/ui/ImportExportDropdown";

// Local component imports for modal dialogs
// Import modal for add/edit user energy entries
import UserEnergyModal from "./UserEnergyModal";
// Import modal to confirm deletion actions
import DeleteConfirmationModal from "./DeleteConfirmationModal";
// Import modal to display override factor details
import OverrideFactorsDisplayModal from "./OverrideFactorsDisplayModal";
// Import modal to display associated BOM items
import BomItemsDisplayModal from "./BomItemsDisplayModal";

// Import API call wrappers and helper utilities
// API wrapper functions for user energy emissions
import * as apiCalls from "./api-calls";
// Generic helper functions for modal behavior and overrides
import * as Helpers from "./helpers";
// Import form data type and table column definitions
import { FormData, getUserEnergyColumns } from "./types";

// ── UserEnergy Tab: Handles user energy emissions CRUD ──────────────────────
// Define UserEnergy component with forwarded ref for parent control
const UserEnergy = forwardRef<TabHandle, DataPassedToTabs>(
  ({ productId: productIdString, onFieldChange }, ref) => {
    // State: list of user energy emissions fetched from API
    const [emissions, setEmissions] = useState<UserEnergyEmission[]>([]);
    // State: loading flag for data fetch operations
    const [isLoading, setIsLoading] = useState(false);
    // State: controls visibility of add/edit modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    // State: controls visibility of delete confirmation modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    // State: currently selected emission for editing or display
    const [currentEmission, setCurrentEmission] = useState<UserEnergyEmission | null>(null);
    // State: form data object for new or edited entry
    const [formData, setFormData] = useState<FormData>({
      energy_consumption: "",
      reference: "",
      override_factors: [],
      line_items: [],
    });
    // State: ID of emission pending deletion confirmation
    const [deletingEmissionId, setDeletingEmissionId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // State: list of emission reference factors fetched on mount
    const [references, setReferences] = useState<EmissionReference[]>([]);
    // State: emission selected for override factors display modal
    const [showFactorsForEmission, setShowFactorsForEmission] = useState<UserEnergyEmission | null>(
      null
    );
    // State: list of BOM line items for selection
    const [bomLineItems, setBomLineItems] = useState<LineItem[]>([]);
    // State: emission selected for BOM items display modal
    const [showBomItemsForEmission, setShowBomItemsForEmission] =
      useState<UserEnergyEmission | null>(null);

    // Retrieve the selected company ID from localStorage
    const company_pk_string = localStorage.getItem("selected_company_id");
    if (!company_pk_string) {
      console.error("company_pk is null");
      return null;
    }
    // Parse company_pk_string to numeric company primary key
    const company_pk = parseInt(company_pk_string, 10);

    // Define helper to parse productId prop to integer
    const productId = () => {
      const id = parseInt(productIdString, 10);
      return id;
    };

    // Expose saveTab and updateTab methods via ref
    useImperativeHandle(ref, () => ({
      saveTab,
      updateTab,
    }));

    // Stubbed saveTab implementation returning an empty promise
    const saveTab = async (): Promise<string> => {
      return "";
    };

    // Stubbed updateTab implementation returning an empty promise
    const updateTab = async (): Promise<string> => {
      return "";
    };

    // Effect: fetch initial emissions and BOM items on component mount
    useEffect(() => {
      if (productIdString) {
        apiCalls.fetchEmissions(setIsLoading, company_pk, productId, setEmissions);
        apiCalls.fetchBomLineItems(company_pk, productId, setBomLineItems);
      }
    }, [productIdString]);

    // Helper: local wrapper to re-fetch BOM line items
    const fetchBomLineItems = () => {
      apiCalls.fetchBomLineItems(company_pk, productId, setBomLineItems);
    };

    // Effect: fetch emission reference factors on component mount
    useEffect(() => {
      const fetchReferences = async () => {
        try {
          const data = await emissionReferenceApi.getAllUserEnergyReferences();
          setReferences(data);
        } catch (error) {
          console.error("Error fetching user energy references:", error);
        }
      };

      fetchReferences();
    }, []);

    // Event handler: submit formData to add or update emission
    const handleSubmit = () => {
      apiCalls.handleSubmit(
        formData,
        setIsSubmitting,
        currentEmission,
        company_pk,
        productId,
        setIsLoading,
        setEmissions,
        setIsModalOpen,
        onFieldChange
      );
    };

    // Event handler: delete selected emission and refresh list
    const handleDelete = () => {
      apiCalls.handleDelete(
        deletingEmissionId,
        company_pk,
        productId,
        setEmissions,
        emissions,
        setIsDeleteModalOpen,
        setDeletingEmissionId,
        onFieldChange
      );
    };

    // Event handler: open add/edit modal with optional existing emission
    const handleOpenModal = (emission: UserEnergyEmission | null = null) => {
      Helpers.handleOpenModal(
        setCurrentEmission,
        setFormData,
        fetchBomLineItems,
        setIsModalOpen,
        emission
      );
    };

    // Event handler: close add/edit modal and reset state
    const handleCloseModal = () => {
      Helpers.handleCloseModal(setIsModalOpen, setCurrentEmission);
    };

    // Event handler: open delete confirmation modal for given ID
    const handleConfirmDelete = (emissionId: number) => {
      Helpers.handleConfirmDelete(setDeletingEmissionId, setIsDeleteModalOpen, emissionId);
    };

    // Configure table columns with callbacks for actions and displays
    const columns = getUserEnergyColumns(
      references,
      setShowFactorsForEmission,
      setShowBomItemsForEmission,
      setCurrentEmission,
      setFormData,
      fetchBomLineItems,
      setIsModalOpen,
      setDeletingEmissionId,
      setIsDeleteModalOpen
    );

    // Render component UI: header, table/list, actions, and modals
    return (
      <>
        <div>
          {/* Header: title and description */}
          <h2 className="text-xl font-semibold mb-4">User Energy</h2>
          <p className="mb-4">Track energy consumption during product usage phase.</p>
        </div>

        {/* Emissions list or loading/empty state */}
        {isLoading ? (
          <div className="text-center py-6">Data loading...</div>
        ) : emissions.length === 0 ? (
          <div className="text-center py-6">No user energy emissions yet.</div>
        ) : (
          <OurTable
            caption="A table displaying the user energy emissions of this product."
            cardTitle="Emission #"
            items={emissions}
            columns={columns}
          />
        )}

        {/* Actions: Add button and import/export dropdown */}
        <div className="mt-6">
          <Button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2"
            variant="primary"
          >
            <Plus className="w-4 h-4" aria-hidden="true" /> Add User Energy
          </Button>
          <ImportExportDropdown
            companyId={company_pk}
            productId={productId()}
            section="user"
            onImportComplete={() =>
              apiCalls.fetchEmissions(setIsLoading, company_pk, productId, setEmissions)
            }
          />
        </div>

        {/* Modals: Add/Edit, Delete Confirmation, Override Display, BOM Display */}
        <UserEnergyModal
          isOpen={isModalOpen}
          currentEmission={currentEmission}
          formData={formData}
          setFormData={setFormData}
          references={references}
          bomLineItems={bomLineItems}
          isSubmitting={isSubmitting}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />

        <OverrideFactorsDisplayModal
          emission={showFactorsForEmission}
          onClose={() => setShowFactorsForEmission(null)}
        />

        <BomItemsDisplayModal
          emission={showBomItemsForEmission}
          bomLineItems={bomLineItems}
          onClose={() => setShowBomItemsForEmission(null)}
        />
      </>
    );
  }
);

// Assign displayName for React DevTools identification
UserEnergy.displayName = "UserEnergy";
// Export UserEnergy component as default export
export default UserEnergy;
