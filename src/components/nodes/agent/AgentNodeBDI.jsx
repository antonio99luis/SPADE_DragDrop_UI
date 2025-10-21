// src/components/nodes/agent/AgentNodeBDI.jsx
import React from 'react';
import AgentNode from './AgentNode';

export default function AgentNodeBDI(props) {
  return (
    <AgentNode
      {...props}
      data={{
        ...props.data,
        kind: 'bdi',
      }}
    />
  );
}
