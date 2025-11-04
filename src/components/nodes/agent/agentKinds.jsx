// src/config/agentKinds.jsx
import React from 'react';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { TextAreaFormField } from '../../forms/FormField';
import KeyValueTable from '../../forms/KeyValueTable';
import CodeConfigurationModal from '../../modals/CodeConfigurationModal';
import { aslMonarch } from '../../../editor/dsl/aslMonarch';

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
      const DEFAULT_ASL = `!start.\n\n+!start <-\n    .my_function(4, R);\n    .my_action(R).`;
      const DEFAULT_FUNC = `def add_custom_actions(self, actions):\n    @actions.add_function(".my_function", (int,))\n    def _my_function(x):\n        return x * x\n\n    @actions.add(".my_action", 1)\n    def _my_action(agent, term, intention):\n        print("hello action")\n        yield`;

      const bdiProgram = modalData.getCurrentValue('bdiProgram') || DEFAULT_ASL;
      const bdiFunctionsText = modalData.getCurrentValue('bdiFunctionsText');
      const rawFns = modalData.getCurrentValue('bdiFunctions');
      const bdiFunctionsCode = (typeof bdiFunctionsText === 'string' && bdiFunctionsText.length > 0)
        ? bdiFunctionsText
        : ((Array.isArray(rawFns) && rawFns.length > 0) ? rawFns.join('\n\n') : DEFAULT_FUNC);

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

      // Initialize beliefsObj once from legacy beliefs if not present
      React.useEffect(() => {
        const existing = modalData.getCurrentValue('beliefsObj');
        if (!existing || (typeof existing === 'object' && Object.keys(existing).length === 0)) {
          const legacy = modalData.getCurrentValue('beliefs');
          const obj = beliefsArrayToObject(legacy);
          if (Object.keys(obj).length > 0) {
            modalData.handleTempChange('beliefsObj', obj);
          }
        }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      const beliefsObj = modalData.getCurrentValue('beliefsObj') || {};

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
            defaultCode={DEFAULT_ASL}
            onChange={(val) => modalData.handleTempChange('bdiProgram', val || '')}
            onReset={() => modalData.handleTempChange('bdiProgram', DEFAULT_ASL)}
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
            defaultCode={DEFAULT_FUNC}
            onChange={(val) => modalData.handleTempChange('bdiFunctionsText', val ?? '')}
            onReset={() => modalData.handleTempChange('bdiFunctionsText', DEFAULT_FUNC)}
            onCancel={() => setOpenPy(false)}
            onSave={() => {
              const text = modalData.getCurrentValue('bdiFunctionsText') ?? '';
              const arr = (text || '').split(/\n\n+/).map(s => s.trim()).filter(Boolean);
              modalData.handleTempChange('bdiFunctions', arr);
              setOpenPy(false);
            }}
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
