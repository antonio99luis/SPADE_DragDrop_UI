import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import BaseNode from '../shared/NodeBase';
import behaviourSVG from '../../../assets/nodeSVG/behaviour.svg';
import './BehaviourNode.css';
import PeriodicBehaviourFields from './fields/PeriodicBehaviourFields';
import TimeoutBehaviourFields from './fields/TimeoutBehaviourFields';
import BehaviourConfigModal from '../../modals/BehaviourConfigModal';
import NodeHeader from '../shared/NodeHeader';
import NodeDivider from '../shared/NodeDivider';
import { LabeledHandle } from '../shared/LabeledHandle';

const behaviourTypes = [
  'CyclicBehaviour',
  'OneShotBehaviour',
  'TimeoutBehaviour',
  'PeriodicBehaviour',
];

const DEFAULT_CONFIG_CODE = {
  CyclicBehaviour: `class MyCyclicBehaviour(CyclicBehaviour):
    async def run(self):
        # Write your cyclic behaviour code here
        pass
`,
  OneShotBehaviour: `class MyOneShotBehaviour(OneShotBehaviour):
    async def run(self):
        # Write your one-shot behaviour code here
        pass
`,
  TimeoutBehaviour: `class MyTimeoutBehaviour(TimeoutBehaviour):
    async def run(self):
        # Write your timeout behaviour code here
        pass
`,
  PeriodicBehaviour: `class MyPeriodicBehaviour(PeriodicBehaviour):
    async def run(self):
        # Write your periodic behaviour code here
        pass
`,
};

// Helper to generate default code using the class field or fallback
const getDefaultConfigCode = (behaviourType, className) => {
  const template = DEFAULT_CONFIG_CODE[behaviourType];
  if (className && className.trim()) {
    // Replace the default class name (e.g., MyCyclicBehaviour) with the user input
    return template.replace(
      new RegExp(`class My${behaviourType}`),
      `class ${className.trim()}`
    );
  }
  // If className is empty, return the default template as is
  return template;
};

// Helper to autocorrect class names to CamelCase
function toCamelCase(str) {
  return str
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

export default function BehaviourNode({ data, selected, id, x, y }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [codeByType, setCodeByType] = useState(() => {
    const initial = {};
    behaviourTypes.forEach(type => {
      initial[type] =
        (data.configCode && data.configCode[type]) ||
        getDefaultConfigCode(type, data.class);
    });
    return initial;
  });

  // When type or class changes, keep code for all types in memory
  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'class' && !modalOpen) {
      if (data.onChange) {
        data.onChange(id, 'class', value);
      }
      // Update code preview for the current type
      setCodeByType(prev => ({
        ...prev,
        [data.type]: getDefaultConfigCode(data.type, value),
      }));
      return;
    }
    const newType = value;
    if (data.onChange) {
      let cleanedFields = {};
      if (newType === 'CyclicBehaviour' || newType === 'OneShotBehaviour') {
        cleanedFields = {};
      } else if (newType === 'TimeoutBehaviour') {
        cleanedFields = { start_at: '' };
      } else if (newType === 'PeriodicBehaviour') {
        cleanedFields = { period: '', start_at: '' };
      }
      data.onChange(id, 'type', newType);
      Object.entries(cleanedFields).forEach(([field, val]) => {
        data.onChange(id, field, val);
      });
      if (newType !== 'PeriodicBehaviour' && data.period !== undefined) {
        data.onChange(id, 'period', undefined);
      }
      if (
        (newType === 'CyclicBehaviour' || newType === 'OneShotBehaviour') &&
        data.start_at !== undefined
      ) {
        data.onChange(id, 'start_at', undefined);
      }
      // Save codeByType to node data
      data.onChange(id, 'configCode', codeByType);
    }
  };

  // Open modal with code for current type and class
  const openModal = () => {
    setTempCode(
      codeByType[data.type] ||
        getDefaultConfigCode(data.type, data.class)
    );
    setModalOpen(true);
  };

  // Save code for current type and persist to node data
  const handleSave = () => {
    const updated = { ...codeByType, [data.type]: tempCode };
    setCodeByType(updated);
    if (data.onChange) {
      data.onChange(id, 'configCode', updated);
    }
    setModalOpen(false);
  };

  // Temp code for the modal editor
  const [tempCode, setTempCode] = useState(codeByType[data.type] || getDefaultConfigCode(data.type, data.class));
  React.useEffect(() => {
    if (modalOpen) setTempCode(codeByType[data.type] || getDefaultConfigCode(data.type, data.class));
  }, [modalOpen, data.type, data.class, codeByType]);

  const handleReset = () => {
    const updated = { ...codeByType, [data.type]: getDefaultConfigCode(data.type, data.class) };
    setCodeByType(updated);
    setTempCode(getDefaultConfigCode(data.type, data.class));
    if (data.onChange) {
      // Remove user code for this type from memory
      const cleaned = { ...codeByType, [data.type]: undefined };
      data.onChange(id, 'configCode', cleaned);
    }
  };

  // Autocorrect class name on blur
  const handleClassBlur = (event) => {
    const value = event.target.value;
    // Only autocorrect if there are spaces
    if (value.includes(' ')) {
      const camel = toCamelCase(value);
      if (data.onChange) {
        data.onChange(id, 'class', camel);
      }
      setCodeByType(prev => ({
        ...prev,
        [data.type]: getDefaultConfigCode(data.type, camel),
      }));
    }
  };

  return (
    <div className={`behaviour-node${selected ? ' behaviour-node-selected' : ''}`}>
      <NodeHeader image={behaviourSVG} title="Behaviour" > </NodeHeader>
      <NodeDivider title="inputs"/>
      {/* Input Handles */}
      <LabeledHandle
        type="target"
        position={Position.Left}
        id="behaviour"
        isConnectable={true}
        title="used by agent"
      />
      <NodeDivider title="attributes"/>
      {/* Behaviour-specific content here */}
      <div className="behaviour-node-attributes">
        <div>
          Class:{' '}
          <input
            className="behaviour-node-input"
            type="text"
            value={data.class || ''}
            onChange={e => data.onChange(id, 'class', e.target.value)}
          />
        </div>
        <div>
          Type:{' '}
          <select
            className="behaviour-node-input"
            value={data.type}
            name="type"
            onChange={handleChange}
            disabled={modalOpen}
          >
            {behaviourTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        {data.type === 'PeriodicBehaviour' && (
          <PeriodicBehaviourFields 
            data={data} 
            id={id} 
            onChange={data.onChange}
            disabled={modalOpen} 
          />
        )}
        {data.type === 'TimeoutBehaviour' && (
          <TimeoutBehaviourFields 
            data={data} 
            id={id} 
            onChange={data.onChange}
            disabled={modalOpen}
          />
        )}
        <button className="behaviour-config-btn" onClick={openModal}>Configure</button>
        <BehaviourConfigModal
          open={modalOpen}
          code={tempCode}
          onChange={setTempCode}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
          position={{ x, y }}
          onReset={handleReset}
        />
      </div>
      <NodeDivider title="outputs"/>
      {/* Source Handles */}
      <LabeledHandle
        type="source"
        position={Position.Right}
        id="template"
        isConnectable={true}
        title="uses template"
      />
    </div>
  );
}