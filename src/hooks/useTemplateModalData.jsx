// src/hooks/useTemplateModalData.jsx
import { useState } from 'react';
import { useModalData } from './useModalData';
import { DEFAULT_METADATA } from '../config/nodeConfigs';

export const useTemplateModalData = (initialData, requiredFields = []) => {
  const modalData = useModalData(initialData, requiredFields);
  const [metadataModalOpen, setMetadataModalOpen] = useState(false);
  const [tempMetadata, setTempMetadata] = useState(initialData.metadataCode || DEFAULT_METADATA);

  // Open metadata modal
  const openMetadataModal = () => {
    setTempMetadata(modalData.getCurrentValue('metadataCode') || DEFAULT_METADATA);
    setMetadataModalOpen(true);
  };

  // Save metadata
  const saveMetadata = (onSaveCallback) => {
    modalData.handleTempChange('metadataCode', tempMetadata);
    if (onSaveCallback) {
      onSaveCallback('metadataCode', tempMetadata);
    }
    setMetadataModalOpen(false);
  };

  // Reset metadata
  const resetMetadata = (onSaveCallback) => {
    setTempMetadata(DEFAULT_METADATA);
    modalData.handleTempChange('metadataCode', DEFAULT_METADATA);
    if (onSaveCallback) {
      onSaveCallback('metadataCode', DEFAULT_METADATA);
    }
  };

  return {
    ...modalData,
    metadataModalOpen,
    tempMetadata,
    setTempMetadata,
    openMetadataModal,
    saveMetadata,
    resetMetadata,
    closeMetadataModal: () => setMetadataModalOpen(false),
  };
};