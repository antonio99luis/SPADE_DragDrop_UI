// src/components/nodes/agent/AgentNodeLLM.jsx
import React from 'react';
import AgentNode from './AgentNode';

export default function AgentNodeLLM(props) {
  return (
    <AgentNode
      {...props}
      data={{
        ...props.data,
        kind: 'llm',
      }}
    />
  );
}
