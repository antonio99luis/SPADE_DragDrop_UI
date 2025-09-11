import React from 'react';
import { BaseEdge, getBezierPath } from '@xyflow/react';
import './FriendshipEdge.css';

export default function FriendshipEdge({ id, sourceX, sourceY, targetX, targetY, markerEnd, selected }) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, targetX, targetY });

  // Calculate the midpoint for the label
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        className={`friendship-edge-path${selected ? ' friendship-edge-selected' : ''}`}
        markerEnd={markerEnd}
      />
      <text
        x={labelX}
        y={labelY}
        className="friendship-edge-label"
      >
        <tspan className="friendship-edge-label-text">Friendship </tspan>
        <tspan className="friendship-edge-label-emoji" dx="2">👁️</tspan>
      </text>
    </>
  );
}