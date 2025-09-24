// src/hooks/useTemplateModalData.jsx
import { useState } from 'react';
import { useModalData } from './useModalData';

const DEFAULT_METADATA = {};

export const useTemplateModalData = (initialData, requiredFields = []) => {
  const modalData = useModalData(initialData, requiredFields);
  const [metadataModalOpen, setMetadataModalOpen] = useState(false);
  const [tempMetadata, setTempMetadata] = useState(initialData.metadata || DEFAULT_METADATA);

  // Open metadata modal
  const openMetadataModal = () => {
    setTempMetadata(modalData.getCurrentValue('metadata') || DEFAULT_METADATA);
    setMetadataModalOpen(true);
  };

  // Save metadata
  const saveMetadata = (onSaveCallback) => {
    modalData.handleTempChange('metadata', tempMetadata);
    if (onSaveCallback) {
      onSaveCallback('metadata', tempMetadata);
    }
    setMetadataModalOpen(false);
  };

  // Reset metadata
  const resetMetadata = (onSaveCallback) => {
    setTempMetadata(DEFAULT_METADATA);
    modalData.handleTempChange('metadata', DEFAULT_METADATA);
    if (onSaveCallback) {
      onSaveCallback('metadata', DEFAULT_METADATA);
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