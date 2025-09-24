// src/hooks/useModalData.js
import { useState, useEffect } from 'react';

export const useModalData = (initialData, requiredFields = []) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [tempData, setTempData] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Handler for temporary data changes
  const handleTempChange = (field, value) => {
    setTempData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field] && value && value.toString().trim()) {
      setErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  // Get current value (temp data takes priority)
  const getCurrentValue = (field) => {
    return tempData.hasOwnProperty(field) ? tempData[field] : (initialData[field] || '');
  };

  // Validation
  const validateFields = () => {
    const newErrors = {};
    const dataToValidate = { ...initialData, ...tempData };
    
    requiredFields.forEach(field => {
      if (!dataToValidate[field] || dataToValidate[field].toString().trim() === '') {
        newErrors[field] = true;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-validate when data changes and modal is open
  useEffect(() => {
    if (modalOpen) {
      const newErrors = {};
      const dataToValidate = { ...initialData, ...tempData };
      
      requiredFields.forEach(field => {
        if (!dataToValidate[field] || dataToValidate[field].toString().trim() === '') {
          newErrors[field] = true;
        }
      });
      
      setErrors(newErrors);
    }
  }, [initialData, tempData, modalOpen, requiredFields]);

  // Handle field blur
  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    const dataToValidate = { ...initialData, ...tempData };
    if (!dataToValidate[field] || dataToValidate[field].toString().trim() === '') {
      setErrors(prev => ({
        ...prev,
        [field]: true
      }));
    }
  };

  // Check if field has error
  const hasError = (field) => {
    return errors[field] && touched[field];
  };

  // Get error message
  const getErrorMessage = (field, defaultMessage) => {
    if (hasError(field)) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    return defaultMessage;
  };

  // Open modal
  const openModal = () => {
    setModalOpen(true);
    setTempData({ ...initialData });
    setErrors({});
    setTouched(
      requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );
    setTimeout(validateFields, 0);
  };

  // Save changes
  const saveChanges = (onSave) => {
    const isValid = validateFields();
    if (isValid) {
      onSave(tempData);
      closeModal();
      return true;
    } else {
      setTouched(
        requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
      );
      return false;
    }
  };

  // Close modal without saving
  const closeModal = () => {
    setModalOpen(false);
    setTempData({});
    setErrors({});
    setTouched({});
  };

  return {
    modalOpen,
    tempData,
    errors,
    touched,
    handleTempChange,
    getCurrentValue,
    validateFields,
    handleBlur,
    hasError,
    getErrorMessage,
    openModal,
    saveChanges,
    closeModal
  };
};