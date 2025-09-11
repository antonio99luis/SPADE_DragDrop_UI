import React from 'react';
import { BaseEdge, getBezierPath } from '@xyflow/react';
import './AgentBehaviourEdge.css';

export default function AgentBehaviourEdge({ id, sourceX, sourceY, targetX, targetY, markerEnd, selected }) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, targetX, targetY });

  // Calculate the midpoint for the label
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        className={`agent-behaviour-edge-path${selected ? ' agent-behaviour-edge-selected' : ''}`}
        markerEnd={markerEnd}
      />
      <text
        x={labelX}
        y={labelY}
        className="agent-behaviour-edge-label"
      >
        <tspan className="friendship-edge-label-text">uses behaviour</tspan>
      </text>
    </>
  );
}