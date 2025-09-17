import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { LabeledHandle } from '../shared/LabeledHandle';
import NodeHeader from '../shared/NodeHeader';
import NodeDivider from '../shared/NodeDivider';
import agentSVG from '../../../assets/nodeSVG/agent.svg';
import './AgentNode.css';
import ConfigurationModal from '../../modals/ConfigurationModal';
import md5 from 'blueimp-md5';
import { toCamelCase } from '../../../utils/stringUtils';

// Returns the gravatar URL for a given jid string (e.g., "name@host")
function buildAvatarUrl(jid) {
  const digest = md5(jid.trim().toLowerCase());
  return `http://www.gravatar.com/avatar/${digest}?d=monsterid`;
}

export default function AgentNode({ data, selected, id}) {
  const [modalOpen, setModalOpen] = useState(false);

  // Handler to update the node's data via ReactFlow's onNodesChange
  const handleChange = (field, value) => {
    if (data.onChange) {
      data.onChange(id, field, value);
    }
  };

  // Notify App about modal state changes
  useEffect(() => {
    if (data.onModalStateChange) {
      data.onModalStateChange(modalOpen);
    }
  }, [modalOpen, data.onModalStateChange]);

  // Autocorrect class name on blur
  const handleClassBlur = (event) => {
    const value = event.target.value;
    // Only autocorrect if there are spaces
    if (value.includes(' ')) {
      const camel = toCamelCase(value);
      handleChange('class', camel);
    }
  };

  return (
    <div className={`agent-node${selected ? ' agent-node-selected' : ''}`}>
      {/* Use dynamic title from data.title or default to "Agent" */}
      <NodeHeader image={agentSVG} title={data.title || "Agent"} />
      
      <NodeDivider title="inputs"/>
      {/* Input Handles */}
      <LabeledHandle
        type="target"
        position={Position.Left}
        id="friendship-target"
        isConnectable={true}
        title="friendship (target)"
      />      
      <LabeledHandle
        type="target"
        position={Position.Left}
        id="inheritance-target"
        isConnectable={true}
        title="inherits from"
      />
      
      <NodeDivider title="attributes"/>
      
      {/* Simplified attributes section with single button */}
      <div className="agent-node-attributes">
        <button 
          className="agent-setup-btn" 
          onClick={() => setModalOpen(true)}
          disabled={modalOpen}
        >
          Configure
        </button>

        {/* NodeSetupModal with all the inputs */}
        <ConfigurationModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={data.title || "Agent"}
          onTitleChange={(newTitle) => handleChange('title', newTitle)} // Add title change handler
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Agent Configuration
              </label>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Configure the basic settings for your agent.
              </p>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Class Name:
              </label>
              <input 
                type="text"
                value={data.class || ''} 
                onChange={(e) => handleChange('class', e.target.value)}
                onBlur={handleClassBlur}
                placeholder="Python class name (e.g., MyAgent)"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              <small style={{ color: '#888', fontSize: '12px' }}>
                The Python class name for this agent
              </small>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Agent Name:
              </label>
              <input 
                type="text"
                value={data.name || ''} 
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Agent instance name (e.g., agent1)"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              <small style={{ color: '#888', fontSize: '12px' }}>
                The unique name for this agent instance
              </small>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Host:
              </label>
              <input 
                type="text"
                value={data.host || ''} 
                onChange={(e) => handleChange('host', e.target.value)}
                placeholder="localhost"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              <small style={{ color: '#888', fontSize: '12px' }}>
                The host where this agent will run
              </small>
            </div>
            
            {/* Display current JID */}
            {data.name && data.host && (
              <div style={{ 
                padding: '16px', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <strong style={{ fontSize: '14px' }}>Agent JID:</strong>
                    <div style={{ fontSize: '16px', fontFamily: 'monospace', color: '#007bff' }}>
                      {data.name}@{data.host}
                    </div>
                  </div>
                  <img 
                    src={buildAvatarUrl(`${data.name}@{data.host}`)}
                    alt="Agent Avatar"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: '2px solid #ddd'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </ConfigurationModal>
      </div>
      
      <NodeDivider title="outputs"/>
      
      {/* Output Handles */}
      <LabeledHandle
        type="source"
        position={Position.Right}
        id="friendship-source"
        title="friendship (source)"
      />
      <LabeledHandle
        type="source"
        position={Position.Right}
        id="behaviour"
        isConnectable={true}
        title="behaviour"
      />
      <LabeledHandle
        type="source"
        position={Position.Right}
        id="inheritance-source"
        isConnectable={true}
        title="inherited by"
      />
    </div>
  );
}