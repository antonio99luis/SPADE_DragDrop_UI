// src/components/nodes/behaviour/BehaviourNode.jsx
import React, { useMemo } from 'react';
import BaseNode from '../BaseNode';
import NodeConfigurationModal from '../../modals/NodeConfigurationModal';
import CodeConfigurationModal from '../../modals/CodeConfigurationModal';
import { TextFormField, SelectFormField } from '../../forms/FormField';
import { useBehaviourModalData } from '../../../hooks/useBehaviourModalData';
import { BEHAVIOUR_CONFIG, BEHAVIOUR_TYPES } from '../../../config/nodeConfigs';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import './BehaviourNode.css';

const BehaviourNode = ({ data, selected, id }) => {
  // Custom hook for modal data management with behaviour-specific logic
  const modalData = useBehaviourModalData(data, BEHAVIOUR_CONFIG.requiredFields);

  // Handle save changes
  const handleSaveChanges = (tempData) => {
    if (data.onChange) {
      Object.keys(tempData).forEach(field => {
        data.onChange(id, field, tempData[field]);
      });
    }
  };

  // Handle modal state changes
  const handleModalStateChange = (isOpen) => {
    if (data.onModalStateChange) {
      data.onModalStateChange(isOpen);
    }
  };

  // Handle double click
  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    modalData.openModal();
    handleModalStateChange(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    modalData.closeModal();
    handleModalStateChange(false);
  };

  // Handle save
  const handleSave = () => {
    const saved = modalData.saveChanges(handleSaveChanges);
    if (saved) {
      handleModalStateChange(false);
    }
  };

  // Handle code save
  const handleCodeSave = () => {
    modalData.saveCode((field, value) => {
      if (data.onChange) {
        data.onChange(id, field, value);
      }
    });
  };

  // Handle code reset
  const handleCodeReset = () => {
    modalData.resetCode((field, value) => {
      if (data.onChange) {
        data.onChange(id, field, value);
      }
    });
  };

  // Memoized attributes for display
  const attributes = useMemo(() => {
    const baseAttrs = [
      { label: "Class", value: data.class || 'Not set' },
      { label: "Type", value: data.type || 'Not set' },
    ];

    // Add type-specific attributes
    if (data.type === 'PeriodicBehaviour') {
      baseAttrs.push({ label: "Period", value: data.period || 'Not set' });
      baseAttrs.push({ label: "Start At", value: data.start_at || 'Not set' });
    } else if (data.type === 'TimeoutBehaviour') {
      baseAttrs.push({ label: "Start At", value: data.start_at || 'Not set' });
    }

    return baseAttrs;
  }, [data]);

  // Check if valid
  const isValid = Object.keys(modalData.errors).length === 0;

  // Get current behaviour type for conditional rendering
  const currentType = modalData.getCurrentValue('type');

  return (
    <>
      <BaseNode
        selected={selected}
        onDoubleClick={handleDoubleClick}
        icon={BEHAVIOUR_CONFIG.icon}
        title={data.title || BEHAVIOUR_CONFIG.title}
        attributes={attributes}
        handles={BEHAVIOUR_CONFIG.handles}
        className="behaviour-node"
      >
        <NodeConfigurationModal
          open={modalData.modalOpen}
          title={modalData.getCurrentValue('title') || BEHAVIOUR_CONFIG.title}
          subtitle={BEHAVIOUR_CONFIG.subtitle}
          onClose={handleModalClose}
          onSave={handleSave}
          onTitleChange={(newTitle) => modalData.handleTempChange('title', newTitle)}
          errors={modalData.errors}
          isValid={isValid}
        >
          <TextFormField
            label="Class Name"
            value={modalData.getCurrentValue('class')}
            onChange={(value) => modalData.handleTempChange('class', value)}
            onBlur={() => modalData.handleClassBlur('class')}
            placeholder="Python class name (e.g., MyBehaviour)"
            required
            error={modalData.hasError('class')}
            helperText={modalData.getErrorMessage('class', "The Python class name for this behaviour")}
          />

          <SelectFormField
            label="Behaviour Type"
            value={modalData.getCurrentValue('type')}
            onChange={(value) => modalData.handleTempChange('type', value)}
            onBlur={() => modalData.handleBlur('type')}
            options={BEHAVIOUR_TYPES}
            required
            error={modalData.hasError('type')}
            helperText={modalData.getErrorMessage('type', "The type of behaviour (Cyclic, OneShot, etc.)")}
          />

          {/* Conditional fields based on behaviour type */}
          {currentType === 'PeriodicBehaviour' && (
            <>
              <TextFormField
                label="Period (seconds)"
                value={modalData.getCurrentValue('period')}
                onChange={(value) => modalData.handleTempChange('period', value)}
                placeholder="e.g., 5.0"
                helperText="How often the behaviour should run (in seconds)"
              />

              <TextFormField
                label="Start At"
                value={modalData.getCurrentValue('start_at')}
                onChange={(value) => modalData.handleTempChange('start_at', value)}
                placeholder="e.g., 2024-01-01 12:00:00"
                helperText="When the behaviour should start (optional)"
              />
            </>
          )}

          {currentType === 'TimeoutBehaviour' && (
            <TextFormField
              label="Start At"
              value={modalData.getCurrentValue('start_at')}
              onChange={(value) => modalData.handleTempChange('start_at', value)}
              placeholder="e.g., 2024-01-01 12:00:00"
              helperText="When the behaviour should start (optional)"
            />
          )}

          {/* Configure Code Button */}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={modalData.openCodeModal}
              fullWidth
              sx={{ mb: 1 }}
            >
              Configure Behaviour Code
            </Button>
          </Box>
        </NodeConfigurationModal>

        {/* Code Configuration Modal */}
        <CodeConfigurationModal
          open={modalData.codeModalOpen}
          code={modalData.tempCode}
          onChange={modalData.setTempCode}
          onSave={handleCodeSave}
          onCancel={modalData.closeCodeModal}
          onReset={handleCodeReset}
          title={`Configure ${currentType} Code`}
        />
      </BaseNode>
    </>
  );
};

export default BehaviourNode;