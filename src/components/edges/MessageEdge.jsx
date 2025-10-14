import React from 'react';
import { BaseEdge, getBezierPath } from '@xyflow/react';
import './MessageEdge.css';

export default function MessageEdge({ id, sourceX, sourceY, targetX, targetY, selected }) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, targetX, targetY });
  
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        className={`message-edge-path${selected ? ' message-edge-selected' : ''}`}
      />
    </>
  );
}