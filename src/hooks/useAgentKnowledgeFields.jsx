// src/hooks/useAgentKnowledgeFields.jsx
import { useMemo } from 'react';
import { validateMetadataKey } from '../utils/agentUtils';

export function useAgentKnowledgeFields(modalData) {
  return useMemo(() => ({
    data: modalData.getCurrentValue('metadata') || {},
    onChange: (newMetadata) => modalData.handleTempChange('metadata', newMetadata),
    label: 'Knowledge',
    keyLabel: 'Knowledge Key',
    valueLabel: 'Knowledge Value',
    keyPlaceholder: 'e.g., priority, category',
    valuePlaceholder: 'e.g., high, notification',
    addButtonText: 'Add Knowledge',
    emptyMessage: 'No knowledge configured. Add knowledge to enhance your messages.',
    validateKey: validateMetadataKey,
    maxHeight: '250px',
  }), [modalData]);
}
