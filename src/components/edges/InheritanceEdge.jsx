import React from 'react';
import { BaseEdge, getBezierPath, MarkerType } from '@xyflow/react';
import './InheritanceEdge.css';

export default function InheritanceEdge({ id, sourceX, sourceY, targetX, targetY, markerStart, selected }){
  const [edgePath] = getBezierPath({ sourceX, sourceY, targetX, targetY });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        className={`inheritance-edge-path${selected ? ' inheritance-edge-selected' : ''}`}
        markerStart={markerStart}
      />
    </>
  );
}