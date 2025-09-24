// src/components/nodes/template/TemplateNode.jsx
import React, { useMemo } from 'react';
import BaseNode from '../BaseNode';
import NodeConfigurationModal from '../../modals/NodeConfigurationModal';
import MetadataConfigurationModal from '../../modals/MetadataConfigurationModal';
import { TextFormField, TextAreaFormField } from '../../forms/FormField';
import { useTemplateModalData } from '../../../hooks/useTemplateModalData';
import { TEMPLATE_CONFIG, DEFAULT_METADATA } from '../../../config/nodeConfigs';
import Button from '@mui/material/Button';
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

  // Handle metadata save
  const handleMetadataSave = () => {
    modalData.saveMetadata((field, value) => {
      if (data.onChange) {
        data.onChange(id, field, value);
      }
    });
  };

  // Handle metadata reset
  const handleMetadataReset = () => {
    modalData.resetMetadata((field, value) => {
      if (data.onChange) {
        data.onChange(id, field, value);
      }
    });
  };

  // Memoized attributes for display
  const attributes = useMemo(() => [
    { label: "Sender", value: data.sender || 'Not set' },
    { label: "To", value: data.to || 'Not set' },
    { label: "Body", value: data.body || 'Not set' },
    { label: "Thread", value: data.thread || 'Not set' },
  ], [data]);

  // Check if valid
  const isValid = Object.keys(modalData.errors).length === 0;

  // Check if metadata is valid JSON
  const isMetadataValid = (metadata) => {
    try {
      JSON.parse(metadata || DEFAULT_METADATA);
      return true;
    } catch (e) {
      return false;
    }
  };

  const metadataStatus = isMetadataValid(data.metadataCode) ? 'success' : 'error';

  return (
    <>
      <BaseNode
        selected={selected}
        onDoubleClick={handleDoubleClick}
        icon={TEMPLATE_CONFIG.icon}
        title={data.title || TEMPLATE_CONFIG.title}
        attributes={[
          ...attributes,
          { 
            label: "Metadata", 
            value: (
              <Chip 
                label={metadataStatus === 'success' ? 'Valid JSON' : 'Invalid JSON'} 
                color={metadataStatus}
                size="small"
              />
            )
          }
        ]}
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
        >
          <TextFormField
            label="Sender"
            value={modalData.getCurrentValue('sender')}
            onChange={(value) => modalData.handleTempChange('sender', value)}
            onBlur={() => modalData.handleBlur('sender')}
            placeholder="sender@example.com"
            required
            error={modalData.hasError('sender')}
            helperText={modalData.getErrorMessage('sender', "The sender of the message")}
          />

          <TextFormField
            label="To"
            value={modalData.getCurrentValue('to')}
            onChange={(value) => modalData.handleTempChange('to', value)}
            onBlur={() => modalData.handleBlur('to')}
            placeholder="recipient@example.com"
            required
            error={modalData.hasError('to')}
            helperText={modalData.getErrorMessage('to', "The recipient of the message")}
          />

          <TextAreaFormField
            label="Body"
            value={modalData.getCurrentValue('body')}
            onChange={(value) => modalData.handleTempChange('body', value)}
            onBlur={() => modalData.handleBlur('body')}
            placeholder="Message content..."
            required
            error={modalData.hasError('body')}
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

          {/* Configure Metadata Button */}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={modalData.openMetadataModal}
              fullWidth
              sx={{ mb: 1 }}
              color={isMetadataValid(modalData.getCurrentValue('metadataCode')) ? 'primary' : 'error'}
            >
              Configure Message Metadata
              {!isMetadataValid(modalData.getCurrentValue('metadataCode')) && ' (Invalid JSON)'}
            </Button>
          </Box>
        </NodeConfigurationModal>

        {/* Metadata Configuration Modal */}
        <MetadataConfigurationModal
          open={modalData.metadataModalOpen}
          code={modalData.tempMetadata}
          onChange={modalData.setTempMetadata}
          onSave={handleMetadataSave}
          onCancel={modalData.closeMetadataModal}
          onReset={handleMetadataReset}
          title="Configure Message Metadata"
        />
      </BaseNode>
    </>
  );
};

export default TemplateNode;