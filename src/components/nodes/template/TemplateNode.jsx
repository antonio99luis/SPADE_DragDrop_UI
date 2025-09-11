import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import templateSVG from '../../../assets/nodeSVG/template.svg';
import TemplateMetadataModal from '../../modals/TemplateMetadataModal';
import './TemplateNode.css';
import { LabeledHandle } from '../shared/LabeledHandle';
import NodeHeader from '../shared/NodeHeader';
import NodeDivider from '../shared/NodeDivider';

export default function TemplateNode({ data, selected, id }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [metadataCode, setMetadataCode] = useState(data.metadataCode || '{}');

  const handleInputChange = (field, value) => {
    if (data.onChange) {
      data.onChange(id, field, value);
    }
  };

  const handleMetadataSave = (code) => {
    setMetadataCode(code);
    if (data.onChange) {
      data.onChange(id, 'metadataCode', code);
    }
    setModalOpen(false);
  };

  return (
    <div className={`template-node${selected ? ' template-node-selected' : ''}`}>
      <NodeHeader image={templateSVG} title="Template" > </NodeHeader>
      <NodeDivider title="inputs"/>
      {/* Target Handles */}
      <LabeledHandle
        type="target"
        position={Position.Left}
        id="template"
        isConnectable={true}
        title="used by behaviour"
      />
      <NodeDivider title="attributes"/>
      <div className="template-node-attributes">
        <div>
          <span className="template-label">Sender:</span>
          <input
            className="template-node-input"
            type="text"
            value={data.sender || ''}
            onChange={e => handleInputChange('sender', e.target.value)}
          />
        </div>
        <div>
          <span className="template-label">To:</span>
          <input
            className="template-node-input"
            type="text"
            value={data.to || ''}
            onChange={e => handleInputChange('to', e.target.value)}
          />
        </div>
        <div>
          <span className="template-label">Body:</span>
          <input
            className="template-node-input"
            type="text"
            value={data.body || ''}
            onChange={e => handleInputChange('body', e.target.value)}
          />
        </div>
        <div>
          <span className="template-label">Thread:</span>
          <input
            className="template-node-input"
            type="text"
            value={data.thread || ''}
            onChange={e => handleInputChange('thread', e.target.value)}
          />
        </div>
        <button className="template-metadata-btn" onClick={() => setModalOpen(true)}>
          Metadata
        </button>
        <TemplateMetadataModal
          open={modalOpen}
          code={metadataCode}
          onChange={setMetadataCode}
          onSave={handleMetadataSave}
          onCancel={() => setModalOpen(false)}
        />
        </div>        
    </div>
  );
}

