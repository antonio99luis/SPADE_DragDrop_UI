// src/components/nodes/BaseNode.jsx
import React from 'react';
import NodeHeader from './shared/NodeHeader';
import NodeDivider from './shared/NodeDivider';
import { LabeledHandle } from './shared/LabeledHandle';
import Typography from '@mui/material/Typography';

const BaseNode = ({ 
  selected, 
  onDoubleClick, 
  icon, 
  title, 
  subtitle,
  actionsRight,
  attributes = [], 
  handles = [], 
  children, 
  className = "base-node" 
}) => {
  return (
    <div
      className={`${className}${selected ? ` ${className}-selected` : ''}`}
      onDoubleClick={onDoubleClick}
      style={{ cursor: 'pointer' }}
    >
  <NodeHeader image={icon} title={title} subtitle={subtitle} actionsRight={actionsRight} />

      <NodeDivider title="attributes" />

      <div className={`${className}-attributes`}>
        {attributes.map(({ label, value }, index) => (
          <Typography key={index} variant="body2" color="text.secondary">
            <strong>{label}:</strong> {value}
          </Typography>
        ))}
      </div>

      {children}

      {handles.length > 0 && (
        <>
          {handles.some(h => h.type === 'target') && (
            <>
              <NodeDivider title="inputs" />
              {handles.filter(h => h.type === 'target').map(handle => (
                <LabeledHandle key={handle.id} {...handle} />
              ))}
            </>
          )}
          
          {handles.some(h => h.type === 'source') && (
            <>
              <NodeDivider title="outputs" />
              {handles.filter(h => h.type === 'source').map(handle => (
                <LabeledHandle key={handle.id} {...handle} />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default BaseNode;