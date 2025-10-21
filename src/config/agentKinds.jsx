// src/config/agentKinds.jsx
import React from 'react';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { ListFormField, TextAreaFormField } from '../components/forms/FormField';

export const AGENT_KIND = {
  STANDARD: 'standard',
  BDI: 'bdi',
  LLM: 'llm',
};

export const AGENT_KIND_OPTIONS = [
  { value: AGENT_KIND.STANDARD, label: 'Standard' },
  { value: AGENT_KIND.BDI, label: 'BDI' },
  { value: AGENT_KIND.LLM, label: 'LLM (experimental)' },
];

// Helper to push attributes
const asChipCount = (count, singular = 'entry', plural = 'entries') => (
  <Chip label={`${count} ${count === 1 ? singular : plural}`} color={count > 0 ? 'success' : 'default'} size="small" />
);

export const agentKinds = {
  [AGENT_KIND.STANDARD]: {
    attributes: (data) => [],
    badge: null,
    ExclusiveSettings: () => null,
  },

  [AGENT_KIND.BDI]: {
    attributes: (data) => {
      const beliefsCount = (data.beliefs || []).length;
      return [
        { label: 'Kind', value: 'BDI' },
        { label: 'Beliefs', value: asChipCount(beliefsCount) },
      ];
    },
    badge: { label: 'BDI', color: 'primary' },
    ExclusiveSettings: ({ modalData, id }) => (
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <ListFormField
          label="Beliefs"
          value={modalData.getCurrentValue('beliefs') || []}
          onChange={(vals) => modalData.handleTempChange('beliefs', vals)}
          placeholder="Type a belief and press Enter or ,"
          helperText="These beliefs will be available to the BDI program"
        />
        <TextAreaFormField
          label="BDI Program (.asl)"
          value={modalData.getCurrentValue('bdiProgram') || ''}
          onChange={(val) => modalData.handleTempChange('bdiProgram', val)}
          rows={8}
          placeholder="Write your .asl program here"
          helperText="This content will be exported to <AgentName>_BDI.asl"
        />
        <TextAreaFormField
          label="Agent Functions (Python)"
          value={(modalData.getCurrentValue('bdiFunctions') || []).join('\n\n')}
          onChange={(val) => modalData.handleTempChange('bdiFunctions', val.split(/\n\n+/))}
          rows={6}
          placeholder="Define optional Python methods for this agent"
          helperText="Separate functions with a blank line"
        />
      </Box>
    ),
  },

  [AGENT_KIND.LLM]: {
    attributes: (data) => [
      { label: 'Kind', value: 'LLM' },
    ],
    badge: { label: 'LLM', color: 'secondary' },
    ExclusiveSettings: ({ modalData }) => (
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextAreaFormField
          label="LLM Prompt"
          value={modalData.getCurrentValue('llmPrompt') || ''}
          onChange={(val) => modalData.handleTempChange('llmPrompt', val)}
          rows={6}
          placeholder="System prompt or instructions for the agent"
          helperText="Experimental: extend codegen later to wire this into the agent"
        />
      </Box>
    ),
  },
};
