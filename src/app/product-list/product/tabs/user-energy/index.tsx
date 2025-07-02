"use client";

// ── Imports ────────────────────────────────────────────────────────────────
import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { DataPassedToTabs, TabHandle } from "../../page";
import { UserEnergyEmission } from "@/lib/api/userEnergyEmissionApi";
import { EmissionReference, emissionReferenceApi } from "@/lib/api/emissionReferenceApi";
import { LineItem } from "@/lib/api/bomApi";
import Button from "@/app/components/ui/Button";
import { Plus } from "lucide-react";
import { OurTable } from "@/app/components/ui/OurTable";
import ImportExportDropdown from "@/app/components/ui/ImportExportDropdown";

// Component imports
import UserEnergyModal from "./UserEnergyModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import OverrideFactorsDisplayModal from "./OverrideFactorsDisplayModal";
import BomItemsDisplayModal from "./BomItemsDisplayModal";

// API and helper imports
import * as apiCalls from "./api-calls";
import * as Helpers from "./helpers";
import { FormData, getUserEnergyColumns } from "./types";

// ── UserEnergy Tab: Handles user energy emissions CRUD ──────────────────────
const UserEnergy = forwardRef<TabHandle, DataPassedToTabs>(
  ({ productId: productIdString, onFieldChange }, ref) => {
    // ── State variables ─────────────────────────────────────────────
    const [emissions, setEmissions] = useState<UserEnergyEmission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentEmission, setCurrentEmission] = useState<UserEnergyEmission | null>(null);
    const [formData, setFormData] = useState<FormData>({
      energy_consumption: "",
      reference: "",
      override_factors: [],
      line_items: [],
    });
    const [deletingEmissionId, setDeletingEmissionId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [references, setReferences] = useState<EmissionReference[]>([]);
    const [showFactorsForEmission, setShowFactorsForEmission] = useState<UserEnergyEmission | null>(
      null
    );
    const [bomLineItems, setBomLineItems] = useState<LineItem[]>([]);
    const [showBomItemsForEmission, setShowBomItemsForEmission] =
      useState<UserEnergyEmission | null>(null);

    // ── Company and product ID helpers ────────────────────────────
    const company_pk_string = localStorage.getItem("selected_company_id");
    if (!company_pk_string) {
      console.error("company_pk is null");
      return null;
    }
    const company_pk = parseInt(company_pk_string, 10);

    const productId = () => {
      const id = parseInt(productIdString, 10);
      return id;
    };

    // ── Expose saveTab/updateTab to parent ───────────────────────
    useImperativeHandle(ref, () => ({
      saveTab,
      updateTab,
    }));

    // ── Save tab function (stub) ─────────────────────────────────
    const saveTab = async (): Promise<string> => {
      return "";
    };

    // ── Update tab function (stub) ───────────────────────────────
    const updateTab = async (): Promise<string> => {
      return "";
    };

    // ── Fetch emissions and BOM items on mount ──────────────────
    useEffect(() => {
      if (productIdString) {
        apiCalls.fetchEmissions(setIsLoading, company_pk, productId, setEmissions);
        apiCalls.fetchBomLineItems(company_pk, productId, setBomLineItems);
      }
    }, [productIdString]);

    const fetchBomLineItems = () => {
      apiCalls.fetchBomLineItems(company_pk, productId, setBomLineItems);
    };

    // ── Fetch emission references on mount ───────────────────────
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

    // ── Event handlers ───────────────────────────────────────────
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

    const handleOpenModal = (emission: UserEnergyEmission | null = null) => {
      Helpers.handleOpenModal(
        setCurrentEmission,
        setFormData,
        fetchBomLineItems,
        setIsModalOpen,
        emission
      );
    };

    const handleCloseModal = () => {
      Helpers.handleCloseModal(setIsModalOpen, setCurrentEmission);
    };

    const handleConfirmDelete = (emissionId: number) => {
      Helpers.handleConfirmDelete(setDeletingEmissionId, setIsDeleteModalOpen, emissionId);
    };

    // ── Define columns of table. ─────────────────────────────────
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

    // ── Render ───────────────────────────────────────────────────
    return (
      <>
        <div>
          <h2 className="text-xl font-semibold mb-4">User Energy</h2>
          <p className="mb-4">Track energy consumption during product usage phase.</p>
        </div>

        {/* ── Emission List ───────────────────────────────────────── */}
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

        {/* Add the Emission button */}
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

        {/* Modals */}
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

UserEnergy.displayName = "UserEnergy";
export default UserEnergy;
