// src/components/nodes/agent/exclusive/ExclusiveSettingsLLM.jsx
import React from 'react';
import Box from '@mui/material/Box';
import { TextAreaFormField } from '../../../forms/FormField';

export default function ExclusiveSettingsLLM({ modalData }) {
  return (
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
  );
}
