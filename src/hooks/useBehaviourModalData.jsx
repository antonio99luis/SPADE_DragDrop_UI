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
  const modalData = useModalData(initialData, requiredFields);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [tempCode, setTempCode] = useState('');
  const [codeByType, setCodeByType] = useState(() => {
    const initial = {};
    BEHAVIOUR_TYPES.forEach(type => {
      initial[type] =
        (initialData.configCode && initialData.configCode[type]) ||
        getDefaultConfigCode(type, initialData.class);
    });
    return initial;
  });

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
        setCodeByType(prev => ({
          ...prev,
          [currentType]: newCode
        }));
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
    const code = codeByType[currentType] || getDefaultConfigCode(currentType, currentClass);
    setTempCode(code);
    setCodeModalOpen(true);
  };

  // Save code
  const saveCode = (onSaveCallback) => {
    const currentType = modalData.getCurrentValue('type');
    const updated = { ...codeByType, [currentType]: tempCode };
    setCodeByType(updated);
    
    if (onSaveCallback) {
      onSaveCallback('configCode', updated);
    }
    
    setCodeModalOpen(false);
  };

  // Reset code
  const resetCode = (onSaveCallback) => {
    const currentType = modalData.getCurrentValue('type');
    const currentClass = modalData.getCurrentValue('class');
    const defaultCode = getDefaultConfigCode(currentType, currentClass);
    
    const updated = { ...codeByType, [currentType]: defaultCode };
    setCodeByType(updated);
    setTempCode(defaultCode);
    
    if (onSaveCallback) {
      onSaveCallback('configCode', updated);
    }
    setCodeModalOpen(false);

  };

  return {
    ...modalData,
    handleTempChange,
    handleClassBlur,
    codeModalOpen,
    tempCode,
    setTempCode,
    codeByType,
    openCodeModal,
    saveCode,
    resetCode,
    closeCodeModal: () => setCodeModalOpen(false),
  };
};