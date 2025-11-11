// src/components/nodes/agent/exclusive/ExclusiveSettingsBDI.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import KeyValueTable from '../../../forms/KeyValueTable';
import CodeConfigurationModal from '../../../modals/CodeConfigurationModal';
import { aslMonarch } from '../../../../editor/dsl/aslMonarch';
import { buildAslCompletionProvider } from '../../../../editor/providers/aslProvider';
import { buildAslCompletionContext } from '../../../../editor/autocomplete/extractors/aslContext';
import { beliefsArrayToObject, beliefsObjectToArray, functionsTextToArray } from '../../../../domain/agents/normalizers';

const DEFAULT_ASL = `!start.\n\n+!start <-\n    .my_function(4, R);\n    .my_action(R).`;
const DEFAULT_FUNC = `def add_custom_actions(self, actions):\n    @actions.add_function(".my_function", (int,))\n    def _my_function(x):\n        return x * x\n\n    @actions.add(".my_action", 1)\n    def _my_action(agent, term, intention):\n        print("hello action")\n        yield`;

export default function ExclusiveSettingsBDI({ modalData, id }) {
  const [openAsl, setOpenAsl] = React.useState(false);
  const [openPy, setOpenPy] = React.useState(false);
  const [aslContextSnap, setAslContextSnap] = React.useState(null);

  const bdiProgram = modalData.getCurrentValue('bdiProgram') || DEFAULT_ASL;
  const bdiFunctionsText = modalData.getCurrentValue('bdiFunctionsText');
  const rawFns = modalData.getCurrentValue('bdiFunctions');
  const bdiFunctionsCode = (typeof bdiFunctionsText === 'string' && bdiFunctionsText.length > 0)
    ? bdiFunctionsText
    : ((Array.isArray(rawFns) && rawFns.length > 0) ? rawFns.join('\n\n') : DEFAULT_FUNC);

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
    modalData.handleTempChange('beliefsObj', newMap);
    modalData.handleTempChange('beliefs', beliefsObjectToArray(newMap));
  };

  // Nota: el contexto de ASL se genera sólo al abrir el modal (snapshot en aslContextSnap)

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
        <Button size="big" variant="outlined" onClick={() => {
          // Build a snapshot of the ASL completion context when opening the modal
          const snap = buildAslCompletionContext({
            bdiFunctionCode: bdiFunctionsCode,
            aslCode: bdiProgram,
            extraBeliefs: beliefsObjectToArray(beliefsObj),
            goals: [],
          });
          setAslContextSnap(snap);
          setOpenAsl(true);
        }}>
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
        onCancel={() => { setOpenAsl(false); setAslContextSnap(null); }}
        onSave={() => { setOpenAsl(false); setAslContextSnap(null); }}
        language="asl"
        customSyntax={aslMonarch}
        // Autocomplete: beliefs, goals, functions; escribe 'py.' para ver funciones Python del agente
        helperText="ASL: usa +! para metas, +? para test, <- para el cuerpo."
        buildCompletionProvider={(monaco, { context, groups }) => buildAslCompletionProvider(monaco, { context, groups })}
        autocompleteGroups={[
          'asl.planSnippets',
          'asl.goals',
          'asl.beliefs',
          'asl.functions',
        ]}
        completionContext={aslContextSnap || { beliefs: [], functions: [], goals: [] }}
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
          modalData.handleTempChange('bdiFunctions', functionsTextToArray(text));
          setOpenPy(false);
        }}
        language="python"
        helperText="Define optional Python methods. Separate functions with a blank line."
      />
    </Box>
  );
}
