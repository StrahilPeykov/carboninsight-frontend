import { useCallback } from 'react';
import { FormData } from './types';
import { TransportEmission } from '@/lib/api/transportEmissionApi';
import { LineItem } from '@/lib/api/bomApi';
import { EmissionReference } from '@/lib/api/emissionReferenceApi';

export const useTransportEmissionForm = (
  formData: FormData,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
  references: EmissionReference[],
  bomLineItems: LineItem[]
) => {
  const handleDistanceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      distance: e.target.value,
    }));
  }, [setFormData]);

  const handleWeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      weight: e.target.value,
    }));
  }, [setFormData]);

  const handleReferenceChange = useCallback((value: string | null) => {
    if (!value) {
      setFormData(prev => ({ ...prev, reference: "" }));
      return;
    }
    const selected = references.find(ref => ref.name === value);
    setFormData(prev => ({
      ...prev,
      reference: selected ? selected.id.toString() : "",
    }));
  }, [setFormData, references]);

  const handleBomItemAdd = useCallback((value: any) => {
    if (value && !formData.line_items.includes(value)) {
      setFormData(prev => ({
        ...prev,
        line_items: [...prev.line_items, value],
      }));
    }
  }, [formData.line_items, setFormData]);

  const handleBomItemRemove = useCallback((itemId: number) => {
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.filter(id => id !== itemId),
    }));
  }, [setFormData]);

  const getSelectedReferenceValue = useCallback(() => {
    return formData.reference
      ? references.find(ref => ref.id.toString() === formData.reference)?.name || ""
      : "";
  }, [formData.reference, references]);

  return {
    handleDistanceChange,
    handleWeightChange,
    handleReferenceChange,
    handleBomItemAdd,
    handleBomItemRemove,
    getSelectedReferenceValue,
  };
};