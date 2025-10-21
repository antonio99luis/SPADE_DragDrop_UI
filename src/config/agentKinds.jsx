// src/config/agentKinds.jsx
import React from 'react';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { TextAreaFormField } from '../components/forms/FormField';
import KeyValueTable from '../components/forms/KeyValueTable';
import CodeConfigurationModal from '../components/modals/CodeConfigurationModal';
import { aslMonarch } from '../editor/dsl/aslMonarch';

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
      const beliefsCount = data.beliefsObj
        ? Object.keys(data.beliefsObj || {}).length
        : (data.beliefs || []).length;
      return [
        { label: 'Kind', value: 'BDI' },
        { label: 'Beliefs', value: asChipCount(beliefsCount) },
      ];
    },
    badge: { label: 'BDI', color: 'primary' },
    ExclusiveSettings: ({ modalData, id }) => {
      const [openAsl, setOpenAsl] = React.useState(false);
      const [openPy, setOpenPy] = React.useState(false);
      const bdiProgram = modalData.getCurrentValue('bdiProgram') || '';
      const bdiFunctionsCode = (modalData.getCurrentValue('bdiFunctions') || []).join('\n\n');

      // Helpers to keep backward compatibility: beliefs stored as array of strings
      const beliefsArrayToObject = (arr) => {
        const obj = {};
        (Array.isArray(arr) ? arr : []).forEach((item) => {
          if (typeof item !== 'string') return;
          const idx = item.indexOf(':');
          if (idx > -1) {
            const k = item.slice(0, idx).trim();
            const v = item.slice(idx + 1).trim();
            if (k) obj[k] = v;
          } else {
            const k = item.trim();
            if (k) obj[k] = '';
          }
        });
        return obj;
      };

      const beliefsObj = modalData.getCurrentValue('beliefsObj')
        || beliefsArrayToObject(modalData.getCurrentValue('beliefs'));

      const handleBeliefsChange = (newMap) => {
        // Save map for UI
        modalData.handleTempChange('beliefsObj', newMap);
        // Also maintain the legacy array of strings for codegen compatibility
        const asArray = Object.entries(newMap).map(([k, v]) =>
          (v !== undefined && v !== null && String(v).trim() !== '') ? `${k}:${v}` : k
        );
        modalData.handleTempChange('beliefs', asArray);
      };

      return (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <KeyValueTable
            data={beliefsObj}
            onChange={handleBeliefsChange}
            label="Beliefs"
            keyLabel="Belief"
            valueLabel="Value (optional)"
            keyPlaceholder="e.g., location"
            valuePlaceholder="e.g., kitchen"
            addButtonText="Add Belief"
            emptyMessage="No beliefs defined. Add beliefs to be available in the BDI program."
            maxHeight="250px"
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="big" variant="outlined" onClick={() => setOpenAsl(true)}>
              Edit BDI Program (.asl)
            </Button>
            <Button size="big" variant="outlined" onClick={() => setOpenPy(true)}>
              Edit Agent Functions (Python)
            </Button>
          </Box>

          {/* ASL Editor Modal */}
          <CodeConfigurationModal
            open={openAsl}
            title="BDI Program (.asl)"
            code={bdiProgram}
            onChange={(val) => modalData.handleTempChange('bdiProgram', val || '')}
            onReset={() => modalData.handleTempChange('bdiProgram', '')}
            onCancel={() => setOpenAsl(false)}
            onSave={() => setOpenAsl(false)}
            language="asl"
            customSyntax={aslMonarch}
            helperText="ASL: use +! for achievement goals, +? for test goals, and <- to start plan bodies."
          />

          {/* Python Functions Editor Modal */}
          <CodeConfigurationModal
            open={openPy}
            title="Agent Functions (Python)"
            code={bdiFunctionsCode}
            onChange={(val) => modalData.handleTempChange('bdiFunctions', (val || '').split(/\n\n+/).map(s => s.trim()).filter(Boolean))}
            onReset={() => modalData.handleTempChange('bdiFunctions', [])}
            onCancel={() => setOpenPy(false)}
            onSave={() => setOpenPy(false)}
            language="python"
            helperText="Define optional Python methods. Separate functions with a blank line."
          />
        </Box>
      );
    },
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
