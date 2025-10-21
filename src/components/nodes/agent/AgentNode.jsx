// src/components/nodes/agent/AgentNode.jsx
import React, { useMemo } from "react";
import { buildAvatarUrl, validateMetadataKey } from '../../../utils/agentUtils';
import BaseNode from '../BaseNode';
import NodeConfigurationModal from '../../modals/NodeConfigurationModal';
import { TextFormField, NumberFormField, SwitchFormField, PasswordFormField } from '../../forms/FormField';
import { useModalData } from '../../../hooks/useModalData';
import { AGENT_CONFIG } from '../../../config/nodeConfigs';
import { agentKinds, AGENT_KIND, AGENT_KIND_OPTIONS } from '../../../config/agentKinds';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import KeyValueTable from '../../forms/KeyValueTable';
import Chip from '@mui/material/Chip';
import JidPreviewCard from './JidPreviewCard';
import { useAgentGeneralFields } from '../../../hooks/useAgentGeneralFields';
import { useAgentKnowledgeFields } from '../../../hooks/useAgentKnowledgeFields';

import "./AgentNode.css";

// Utility moved to utils/agentUtils.js

const AgentNode = ({ data, selected, id }) => {
  // Custom hook for modal data management
  const modalData = useModalData(data, AGENT_CONFIG.requiredFields);
  const [exclusiveOpen, setExclusiveOpen] = React.useState(false);

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

  // Validator moved to utils/agentUtils.js

  // Handle metadata change
  const handleMetadataChange = (newMetadata) => {
    modalData.handleTempChange('metadata', newMetadata);
  };



  // Memoized attributes for display
  const attributes = useMemo(() => {
    const metadataCount = Object.keys(data.metadata || {}).length;
    const memoData= [
      { label: "Class", value: data.class || 'Not set' },
      { label: "Name", value: data.name || 'Not set' },
      { label: "Host", value: data.host || 'Not set' },
      { label: "Port", value: data.port || 5222 },
      { label: "Verify Security", value: data.verify_security === true ? 'Enabled' : 'Disabled' },
      { 
        label: "Knowledge", 
        value: (
          <Chip 
            label={`${metadataCount} ${metadataCount === 1 ? 'entry' : 'entries'}`} 
            color={metadataCount > 0 ? 'success' : 'default'}
            size="small"
          />
        )
      }
    ];
    const kind = data.kind || AGENT_KIND.STANDARD;
    const kindAttrs = (agentKinds[kind]?.attributes?.(data) || []).filter(attr => attr.label !== 'Kind');
    memoData.push(...kindAttrs);
    return memoData;
  }, [data]);

  // Check if valid
  const isValid = Object.keys(modalData.errors).length === 0;
  const kind = data.kind || AGENT_KIND.STANDARD;
  const badge = agentKinds[kind]?.badge;
  const kindLabel = badge?.label || null;
  const baseTitle = data.title || AGENT_CONFIG.title;
  const headerTitle = baseTitle;
  const headerActions = badge ? (
    <Chip size="small" label={badge.label} color={badge.color} variant="outlined" />
  ) : null;

  // Shim to reuse kind-specific field renderers with live updates (no temp buffer)
  const exclusiveShim = React.useMemo(() => ({
    getCurrentValue: (field) => data[field],
    handleTempChange: (field, value) => {
      if (data.onChange) data.onChange(id, field, value);
    },
  }), [data, id]);

  // Presenter hooks for cleaner form props
  const fields = useAgentGeneralFields(modalData);
  const knowledge = useAgentKnowledgeFields(modalData);

  return (
    <>
      <BaseNode
        selected={selected}
        onDoubleClick={handleDoubleClick}
        icon={AGENT_CONFIG.icon}
        title={headerTitle}
        attributes={attributes}
        actionsRight={headerActions}
        handles={AGENT_CONFIG.handles}
        className="agent-node"
      >
        {/* Kind-exclusive settings button */}
        {kind !== AGENT_KIND.STANDARD && (
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
            <Button size="medium" variant="outlined" onClick={() => setExclusiveOpen(true)}>
              {kind === AGENT_KIND.BDI ? 'BDI settings' : 'LLM settings'}
            </Button>
          </Box>
        )}
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
          <TextFormField {...fields.classField} />
          <TextFormField {...fields.nameField} />
          <TextFormField {...fields.hostField} />
          <PasswordFormField {...fields.passwordField} />
          <NumberFormField {...fields.portField} />
          <SwitchFormField {...fields.verifySecurityField} />

          {/* Kind-specific fields are shown only in the exclusive modal now */}
          {/* JID Preview */}
          <JidPreviewCard name={modalData.getCurrentValue('name')} host={modalData.getCurrentValue('host')} />
          {/* Metadata Section */}
          <Box sx={{ mt: 3 }}>
            <KeyValueTable {...knowledge} />
          </Box>
        </NodeConfigurationModal>

        {/* Exclusive kind configuration modal */}
        {kind !== AGENT_KIND.STANDARD && (
          <NodeConfigurationModal
            open={exclusiveOpen}
            title={kind === AGENT_KIND.BDI ? 'BDI Configuration' : 'LLM Configuration'}
            subtitle={kind === AGENT_KIND.BDI ? 'Exclusive BDI settings' : 'Exclusive LLM settings'}
            onClose={() => setExclusiveOpen(false)}
            onSave={() => setExclusiveOpen(false)}
            onTitleChange={() => {}}
            errors={{}}
            isValid={true}
          >
            {(() => {
              const Exclusive = agentKinds[kind]?.ExclusiveSettings;
              return Exclusive ? <Exclusive modalData={exclusiveShim} id={id} /> : null;
            })()}
          </NodeConfigurationModal>
        )}
      </BaseNode>
    </>
  );
};

export default AgentNode;