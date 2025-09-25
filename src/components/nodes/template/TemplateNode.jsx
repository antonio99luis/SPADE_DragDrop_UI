// src/components/nodes/template/TemplateNode.jsx
import React, { useMemo } from 'react';
import BaseNode from '../BaseNode';
import NodeConfigurationModal from '../../modals/NodeConfigurationModal';
import KeyValueTable from '../../forms/KeyValueTable';
import { TextFormField, TextAreaFormField } from '../../forms/FormField';
import { useTemplateModalData } from '../../../hooks/useTemplateModalData';
import { TEMPLATE_CONFIG } from '../../../config/nodeConfigs';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import './TemplateNode.css';

const TemplateNode = ({ data, selected, id }) => {
  // Custom hook for modal data management with template-specific logic
  const modalData = useTemplateModalData(data, TEMPLATE_CONFIG.requiredFields);

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

  // Validate metadata key
  const validateMetadataKey = (key) => {
    if (!key.trim()) {
      return "Key cannot be empty";
    }
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key.trim())) {
      return "Key must be a valid identifier (letters, numbers, underscore)";
    }
    return null;
  };

  // Handle metadata change
  const handleMetadataChange = (newMetadata) => {
    modalData.handleTempChange('metadata', newMetadata);
  };

  // Memoized attributes for display
  const attributes = useMemo(() => {
    const metadataCount = Object.keys(data.metadata || {}).length;
    
    return [
      { label: "Sender", value: data.sender || 'Not set' },
      { label: "To", value: data.to || 'Not set' },
      { label: "Body", value: data.body || 'Not set' },
      { label: "Thread", value: data.thread || 'Not set' },
      { 
        label: "Metadata", 
        value: (
          <Chip 
            label={`${metadataCount} ${metadataCount === 1 ? 'entry' : 'entries'}`} 
            color={metadataCount > 0 ? 'success' : 'default'}
            size="small"
          />
        )
      }
    ];
  }, [data]);

  // Check if valid
  const isValid = Object.keys(modalData.errors).length === 0;

  return (
    <>
      <BaseNode
        selected={selected}
        onDoubleClick={handleDoubleClick}
        icon={TEMPLATE_CONFIG.icon}
        title={data.title || TEMPLATE_CONFIG.title}
        attributes={attributes}
        handles={TEMPLATE_CONFIG.handles}
        className="template-node"
      >
        <NodeConfigurationModal
          open={modalData.modalOpen}
          title={modalData.getCurrentValue('title') || TEMPLATE_CONFIG.title}
          subtitle={TEMPLATE_CONFIG.subtitle}
          onClose={handleModalClose}
          onSave={handleSave}
          onTitleChange={(newTitle) => modalData.handleTempChange('title', newTitle)}
          errors={modalData.errors}
          isValid={isValid}
          width="70%" // Make modal wider to accommodate the table
        >
          {/* Basic Fields */}
          <TextFormField
            label="Sender"
            value={modalData.getCurrentValue('sender')}
            onChange={(value) => modalData.handleTempChange('sender', value)}
            //onBlur={() => modalData.handleBlur('sender')}
            placeholder="sender@example.com"
            //error={modalData.hasError('sender')}
            helperText={modalData.getErrorMessage('sender', "The sender of the message")}
          />

          <TextFormField
            label="To"
            value={modalData.getCurrentValue('to')}
            onChange={(value) => modalData.handleTempChange('to', value)}
            //onBlur={() => modalData.handleBlur('to')}
            placeholder="recipient@example.com"
            //error={modalData.hasError('to')}
            helperText={modalData.getErrorMessage('to', "The recipient of the message")}
          />

          <TextAreaFormField
            label="Body"
            value={modalData.getCurrentValue('body')}
            onChange={(value) => modalData.handleTempChange('body', value)}
            //onBlur={() => modalData.handleBlur('body')}
            placeholder="Message content..."
            //error={modalData.hasError('body')}
            helperText={modalData.getErrorMessage('body', "The main content of the message")}
            rows={4}
          />

          <TextFormField
            label="Thread"
            value={modalData.getCurrentValue('thread')}
            onChange={(value) => modalData.handleTempChange('thread', value)}
            placeholder="conversation-thread-id"
            helperText="Optional thread identifier for message grouping"
          />

          {/* Metadata Section */}
          <Box sx={{ mt: 3 }}>
            <KeyValueTable
              data={modalData.getCurrentValue('metadata') || {}}
              onChange={handleMetadataChange}
              label="Message Metadata"
              keyLabel="Metadata Key"
              valueLabel="Metadata Value"
              keyPlaceholder="e.g., priority, category"
              valuePlaceholder="e.g., high, notification"
              addButtonText="Add Metadata"
              emptyMessage="No metadata configured. Add metadata to enhance your messages."
              validateKey={validateMetadataKey}
              maxHeight="250px"
            />
          </Box>
        </NodeConfigurationModal>
      </BaseNode>
    </>
  );
};

export default TemplateNode;