// src/components/nodes/behaviour/BehaviourNode.jsx
import React, { useEffect, useMemo } from 'react';
import BaseNode from '../BaseNode';
import NodeConfigurationModal from '../../modals/NodeConfigurationModal';
import CodeConfigurationModal from '../../modals/CodeConfigurationModal';
import {
  TextFormField,
  SelectFormField,
  FloatFormField,
  DateTimeFormField
} from '../../forms/FormField';
import { useBehaviourModalData } from '../../../hooks/useBehaviourModalData';
import { BEHAVIOUR_CONFIG, BEHAVIOUR_TYPES } from '../../../config/nodeConfigs';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import './BehaviourNode.css';
import { useI18n } from '../../../i18n/I18nProvider';


const BehaviourNode = ({ data, selected, id }) => {
  const { t } = useI18n();
  // Custom hook for modal data management with behaviour-specific logic
  const modalData = useBehaviourModalData(data, BEHAVIOUR_CONFIG.requiredFields);
  const [connectedNodes, setConnectedNodes] = React.useState([]);
  const [tempConfigCode, setTempConfigCode] = React.useState([]);
  // Ensure the node's data gets an initialized configCode on first render
  useEffect(() => {
    if ((!data.configCode || typeof data.configCode !== 'object') && typeof data.onChange === 'function') {
      const cfg = modalData.getCurrentValue('configCode');
      if (cfg && typeof cfg === 'object') {
        data.onChange(id, 'configCode', cfg);
      }
    }
  }, [data.configCode, data.onChange, id, modalData]);
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
  const getConnectedNodes = (nodeId) => {
    if (data.getConnectedNodes) {
      return data.getConnectedNodes(nodeId);
    }
    return [];
  }
  // Handle double click
  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    modalData.openModal();
    //connectedNodes = getConnectedNodes(id); // You'll need to implement this
    handleModalStateChange(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    modalData.closeModal();
    handleModalStateChange(false);
  };

  // Handle save with extra validation for start time mode
  const handleSave = () => {
    const currentType = modalData.getCurrentValue('type');
    const mode = modalData.getCurrentValue('start_at_mode') || 'absolute';
    if ((currentType === 'PeriodicBehaviour' || currentType === 'TimeoutBehaviour') && mode === 'relative') {
      const val = modalData.getCurrentValue('start_at_offset_s');
      const num = val === '' || val === undefined ? NaN : Number(val);
      if (!Number.isFinite(num) || num < 0) {
        window.alert(t('alerts.behaviour.startAfterNonNegative'));
        return;
      }
    }

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
    setTempConfigCode(prev => ({
      ...prev,
      [data.type]: defaultCode
    }));
  };


  // Helper to format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Helper to format period for display
  const formatPeriodForDisplay = (period) => {
    if (!period) return 'Not set';
    const num = parseFloat(period);
    return isNaN(num) ? 'Invalid' : `${num}s`;
  };

  // Memoized attributes for display
  const attributes = useMemo(() => {
    const baseAttrs = [
      { label: t("behaviour.class"), value: data.class || t('notSet') },
      { label: t("behaviour.type"), value: data.type || t('notSet') },
    ];

    // Add type-specific attributes
    if (data.type === 'PeriodicBehaviour') {
      baseAttrs.push({
        label: "Period",
        value: formatPeriodForDisplay(data.period)
      });
      if ((data.start_at_mode || 'absolute') === 'relative') {
        baseAttrs.push({ label: t("behaviour.startAfter"), value: data.start_at_offset_s ?? t('notSet') });
      } else {
        baseAttrs.push({ label: t("behaviour.startAt"), value: formatDateForDisplay(data.start_at) });
      }
    } else if (data.type === 'TimeoutBehaviour') {
      if ((data.start_at_mode || 'absolute') === 'relative') {
        baseAttrs.push({ label: t("behaviour.startAfter"), value: data.start_at_offset_s ?? t('notSet') });
      } else {
        baseAttrs.push({ label: t("behaviour.startAt"), value: formatDateForDisplay(data.start_at) });
      }
    }

    return baseAttrs;
  }, [data, t]);

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
        title={data.title || t(BEHAVIOUR_CONFIG.titleKey || '', BEHAVIOUR_CONFIG.title)}
        attributes={attributes}
        handles={BEHAVIOUR_CONFIG.handles}
        className="behaviour-node"
      >
        <NodeConfigurationModal
          open={modalData.modalOpen}
          title={modalData.getCurrentValue('title') || t(BEHAVIOUR_CONFIG.titleKey || '', BEHAVIOUR_CONFIG.title)}
          subtitle={t(BEHAVIOUR_CONFIG.subtitleKey || '', BEHAVIOUR_CONFIG.subtitle)}
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
              <FloatFormField
                label="Period (seconds)"
                value={modalData.getCurrentValue('period')}
                onChange={(value) => modalData.handleTempChange('period', value)}
                onBlur={() => modalData.handleBlur('period')}
                placeholder="e.g., 5.0"
                helperText="How often the behaviour should run (in seconds)"
                min={0.1}
                step={0.1}
              />

              <SelectFormField
                label="Start time mode"
                value={modalData.getCurrentValue('start_at_mode') || 'absolute'}
                onChange={(value) => {
                  modalData.handleTempChange('start_at_mode', value);
                  if (value === 'absolute') {
                    modalData.handleTempChange('start_at_offset_s', '');
                  } else {
                    modalData.handleTempChange('start_at', '');
                  }
                }}
                options={['absolute', 'relative']}
                helperText="Choose absolute date/time or relative seconds from now"
              />

              { (modalData.getCurrentValue('start_at_mode') || 'absolute') === 'absolute' ? (
                <DateTimeFormField
                  label="Start At"
                  value={modalData.getCurrentValue('start_at')}
                  onChange={(value) => modalData.handleTempChange('start_at', value)}
                  onBlur={() => modalData.handleBlur('start_at')}
                  helperText="When the behaviour should start (optional)"
                  placeholder="Select date and time"
                />
              ) : (
                <FloatFormField
                  label="Start after (seconds)"
                  value={modalData.getCurrentValue('start_at_offset_s')}
                  onChange={(value) => modalData.handleTempChange('start_at_offset_s', value)}
                  placeholder="e.g., 2.5"
                  helperText="Seconds to wait from now before first run"
                  min={0}
                  step={0.1}
                />
              )}
            </>
          )}

          {currentType === 'TimeoutBehaviour' && (
            <>
              <SelectFormField
                label="Start time mode"
                value={modalData.getCurrentValue('start_at_mode') || 'absolute'}
                onChange={(value) => {
                  modalData.handleTempChange('start_at_mode', value);
                  if (value === 'absolute') {
                    modalData.handleTempChange('start_at_offset_s', '');
                  } else {
                    modalData.handleTempChange('start_at', '');
                  }
                }}
                options={['absolute', 'relative']}
                helperText="Choose absolute date/time or relative seconds from now"
              />

              { (modalData.getCurrentValue('start_at_mode') || 'absolute') === 'absolute' ? (
                <DateTimeFormField
                  label="Start At"
                  value={modalData.getCurrentValue('start_at')}
                  onChange={(value) => modalData.handleTempChange('start_at', value)}
                  onBlur={() => modalData.handleBlur('start_at')}
                  helperText="When the behaviour should start (optional)"
                  placeholder="Select date and time"
                />
              ) : (
                <FloatFormField
                  label="Start after (seconds)"
                  value={modalData.getCurrentValue('start_at_offset_s')}
                  onChange={(value) => modalData.handleTempChange('start_at_offset_s', value)}
                  placeholder="e.g., 2.5"
                  helperText="Seconds to wait from now before first run"
                  min={0}
                  step={0.1}
                />
              )}
            </>
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
          onChange={modalData.handleTempCodeChange} // Use the new handler
          onSave={modalData.saveCode}              // Saves and closes
          onCancel={modalData.closeCodeModal}      // Reverts and closes  
          onReset={modalData.resetCode}            // Resets to default (stays open)
          title="Configure Behaviour Code"
        />
      </BaseNode>
    </>
  );
};

export default BehaviourNode;