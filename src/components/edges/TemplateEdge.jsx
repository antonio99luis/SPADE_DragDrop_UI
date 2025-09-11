import React from 'react';
import { BaseEdge, getBezierPath } from '@xyflow/react';
import './TemplateEdge.css';

export default function TemplateEdge({ id, sourceX, sourceY, targetX, targetY, selected }) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, targetX, targetY });
  
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        className={`template-edge-path${selected ? ' template-edge-selected' : ''}`}
      />
    </>
  );
}