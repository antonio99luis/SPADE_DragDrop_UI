// src/hooks/useBehaviourModalData.jsx
import { useState } from 'react';
import { useModalData } from './useModalData';
import { DEFAULT_CONFIG_CODE, BEHAVIOUR_TYPES } from '../config/nodeConfigs';

// Helper to generate default code using the class field or fallback
const getDefaultConfigCode = (behaviourType, className) => {
  const template = DEFAULT_CONFIG_CODE[behaviourType];
  if (className && className.trim()) {
    return template.replace(
      new RegExp(`class My${behaviourType}`),
      `class ${className.trim()}`
    );
  }
  return template;
};

// Helper to autocorrect class names to CamelCase
const toCamelCase = (str) => {
  return str
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

export const useBehaviourModalData = (initialData, requiredFields = []) => {
  // Initialize configCode in the initial data if it doesn't exist
  const initialDataWithCode = {
    ...initialData,
    configCode: initialData.configCode || (() => {
      const initial = {};
      BEHAVIOUR_TYPES.forEach(type => {
        initial[type] = getDefaultConfigCode(type, initialData.class);
      });
      return initial;
    })()
  };

  const modalData = useModalData(initialDataWithCode, requiredFields);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [tempCode, setTempCode] = useState('');
  const [originalCodeBeforeEdit, setOriginalCodeBeforeEdit] = useState('');

  // Helper to get current configCode from modalData
  const getCurrentConfigCode = () => {
    return modalData.getCurrentValue('configCode') || {};
  };

  // Helper to update configCode in modalData
  const updateConfigCode = (newConfigCode) => {
    modalData.handleTempChange('configCode', newConfigCode);
  };

  // Override handleTempChange to handle type changes
  const handleTempChange = (field, value) => {
    modalData.handleTempChange(field, value);
    
    // Handle type change - clean up irrelevant fields
    if (field === 'type') {
      const newType = value;
      
      if (newType === 'CyclicBehaviour' || newType === 'OneShotBehaviour') {
        modalData.handleTempChange('period', '');
        modalData.handleTempChange('start_at', '');
      } else if (newType === 'TimeoutBehaviour') {
        modalData.handleTempChange('period', '');
      }
    }

    // Handle class change - update code preview
    if (field === 'class') {
      const currentType = modalData.getCurrentValue('type');
      if (currentType) {
        const newCode = getDefaultConfigCode(currentType, value);
        const currentConfigCode = getCurrentConfigCode();
        const updatedConfigCode = {
          ...currentConfigCode,
          [currentType]: newCode
        };
        updateConfigCode(updatedConfigCode);
      }
    }
  };

  // Handle class blur with CamelCase correction
  const handleClassBlur = (field) => {
    modalData.handleBlur(field);
    
    if (field === 'class') {
      const value = modalData.getCurrentValue('class');
      if (value && value.includes(' ')) {
        const camelCase = toCamelCase(value);
        modalData.handleTempChange('class', camelCase);
      }
    }
  };

  // Open code modal
  const openCodeModal = () => {
    const currentType = modalData.getCurrentValue('type');
    const currentClass = modalData.getCurrentValue('class');
    const currentConfigCode = getCurrentConfigCode();
    const code = currentConfigCode[currentType] || getDefaultConfigCode(currentType, currentClass);
    
    setTempCode(code);
    setOriginalCodeBeforeEdit(code); // Store original code for cancel functionality
    setCodeModalOpen(true);
  };

  // Save code and close modal
  const saveCode = () => {
    const currentType = modalData.getCurrentValue('type');
    const currentConfigCode = getCurrentConfigCode();
    const updatedConfigCode = {
      ...currentConfigCode,
      [currentType]: tempCode
    };
    
    // Update the configCode in modalData (this will be accessible as behavior.data.configCode)
    updateConfigCode(updatedConfigCode);
    setCodeModalOpen(false);
  };

  // Reset to default code (but don't close modal)
  const resetCode = () => {
    const currentType = modalData.getCurrentValue('type');
    const currentClass = modalData.getCurrentValue('class');
    const defaultCode = getDefaultConfigCode(currentType, currentClass);
    
    // Update tempCode to show the reset in the editor
    setTempCode(defaultCode);
  };

  // Close modal without saving - revert to original code
  const closeCodeModal = () => {
    // Revert tempCode back to the original code before editing
    setTempCode(originalCodeBeforeEdit);
    setCodeModalOpen(false);
  };

  // Handle tempCode changes in the editor
  const handleTempCodeChange = (newCode) => {
    setTempCode(newCode);
  };

  // Get the current code by type for display purposes
  const getCodeByType = () => {
    return getCurrentConfigCode();
  };

  return {
    ...modalData,
    handleTempChange,
    handleClassBlur,
    codeModalOpen,
    tempCode,
    setTempCode,
    handleTempCodeChange,
    codeByType: getCodeByType(), // For backward compatibility
    openCodeModal,
    saveCode,
    resetCode,
    closeCodeModal,
  };
};