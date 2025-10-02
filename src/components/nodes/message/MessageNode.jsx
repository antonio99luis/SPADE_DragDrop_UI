// src/components/nodes/message/MessageNode.jsx
import React, { useMemo } from 'react';
import BaseNode from '../BaseNode';
import NodeConfigurationModal from '../../modals/NodeConfigurationModal';
import { TextFormField, TextAreaFormField } from '../../forms/FormField';
import { useModalData } from '../../../hooks/useModalData';
import { MESSAGE_CONFIG } from '../../../config/nodeConfigs';
import './MessageNode.css';

const MessageNode = ({ data, selected, id }) => {
  // Custom hook for modal data management with message-specific logic
  const modalData = useModalData(data, MESSAGE_CONFIG.requiredFields);

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


  
  // Memoized attributes for display
  const attributes = useMemo(() => {    
    return [
      { label: "Sender", value: data.sender || 'Not set' },
      { label: "To", value: data.to || 'Not set' },
      { label: "Body", value: data.body || 'Not set' },
      { label: "Thread", value: data.thread || 'Not set' }
    ];
  }, [data]);

  // Check if valid
  const isValid = Object.keys(modalData.errors).length === 0;

  return (
    <>
      <BaseNode
        selected={selected}
        onDoubleClick={handleDoubleClick}
        icon={MESSAGE_CONFIG.icon}
        title={data.title || MESSAGE_CONFIG.title}
        attributes={attributes}
        handles={MESSAGE_CONFIG.handles}
        className="message-node"
      >
        <NodeConfigurationModal
          open={modalData.modalOpen}
          title={modalData.getCurrentValue('title') || MESSAGE_CONFIG.title}
          subtitle={MESSAGE_CONFIG.subtitle}
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
        </NodeConfigurationModal>
      </BaseNode>
    </>
  );
};

export default MessageNode;