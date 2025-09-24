// src/components/nodes/agent/AgentNode.jsx
import React, { useMemo } from "react";
import md5 from 'blueimp-md5';
import BaseNode from '../BaseNode';
import NodeConfigurationModal from '../../modals/NodeConfigurationModal';
import { TextFormField, NumberFormField, SwitchFormField,PasswordFormField } from '../../forms/FormField';
import { useModalData } from '../../../hooks/useModalData';
import { AGENT_CONFIG } from '../../../config/nodeConfigs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import "./AgentNode.css";

// Utility function
const buildAvatarUrl = (jid) => {
  const digest = md5(jid.trim().toLowerCase());
  return `http://www.gravatar.com/avatar/${digest}?d=monsterid`;
};

const AgentNode = ({ data, selected, id }) => {
  // Custom hook for modal data management
  const modalData = useModalData(data, AGENT_CONFIG.requiredFields);

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
  const attributes = useMemo(() => [
    { label: "Class", value: data.class || 'Not set' },
    { label: "Name", value: data.name || 'Not set' },
    { label: "Host", value: data.host || 'Not set' },
    { label: "Port", value: data.port || 5222 },
    { label: "Verify Security", value: data.verify_security === true ? 'Enabled' : 'Disabled' }
  ], [data]);

  // Check if valid
  const isValid = Object.keys(modalData.errors).length === 0;

  return (
    <>
      <BaseNode
        selected={selected}
        onDoubleClick={handleDoubleClick}
        icon={AGENT_CONFIG.icon}
        title={data.title || AGENT_CONFIG.title}
        attributes={attributes}
        handles={AGENT_CONFIG.handles}
        className="agent-node"
      >
        <NodeConfigurationModal
          open={modalData.modalOpen}
          title={modalData.getCurrentValue('title') || AGENT_CONFIG.title}
          subtitle={AGENT_CONFIG.subtitle}
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
            onBlur={() => modalData.handleBlur('class')}
            placeholder="Python class name (e.g., MyAgent)"
            required
            error={modalData.hasError('class')}
            helperText={modalData.getErrorMessage('class', "The Python class name for this agent")}
          />

          <TextFormField
            label="Agent Name"
            value={modalData.getCurrentValue('name')}
            onChange={(value) => modalData.handleTempChange('name', value)}
            onBlur={() => modalData.handleBlur('name')}
            placeholder="Agent instance name (e.g., agent1)"
            required
            error={modalData.hasError('name')}
            helperText={modalData.getErrorMessage('name', "The unique name for this agent instance")}
          />

          <TextFormField
            label="Host"
            value={modalData.getCurrentValue('host')}
            onChange={(value) => modalData.handleTempChange('host', value)}
            onBlur={() => modalData.handleBlur('host')}
            placeholder="localhost"
            required
            error={modalData.hasError('host')}
            helperText={modalData.getErrorMessage('host', "The host where this agent will run")}
          />

          <PasswordFormField
            label="Password"
            value={modalData.getCurrentValue('password')}
            onChange={(value) => modalData.handleTempChange('password', value)}
            onBlur={() => modalData.handleBlur('password')}
            placeholder="password"
            type="password"
            required
            error={modalData.hasError('password')}
            helperText={modalData.getErrorMessage('password', "The password for this agent")}
          />

          <NumberFormField
            label="Port"
            value={modalData.getCurrentValue('port')}
            onChange={(value) => modalData.handleTempChange('port', value)}
            placeholder="5222"
            helperText="The port number where this agent will run"
          />

          <SwitchFormField
            label="Verify Security"
            checked={modalData.getCurrentValue('verify_security')}
            onChange={(checked) => modalData.handleTempChange('verify_security', checked)}
          />

          {/* JID Preview */}
          {modalData.getCurrentValue('name') && modalData.getCurrentValue('host') && (
            <Card variant="outlined" sx={{ mt: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Agent JID Preview:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'monospace',
                      color: 'primary.main',
                      fontSize: '16px'
                    }}
                  >
                    {modalData.getCurrentValue('name')}@{modalData.getCurrentValue('host')}
                  </Typography>
                </Box>
                <Avatar
                  src={buildAvatarUrl(`${modalData.getCurrentValue('name')}@${modalData.getCurrentValue('host')}`)}
                  alt="Agent Avatar"
                  sx={{ width: 40, height: 40 }}
                />
              </CardContent>
            </Card>
          )}
        </NodeConfigurationModal>
      </BaseNode>
    </>
  );
};

export default AgentNode;