// src/hooks/useFlowEditor.js
import { useCallback, useState } from "react";
import { useNodesState, useEdgesState, addEdge } from "@xyflow/react";
import { checkConnectionType, createNodeData } from "../commons/flowUtils";

export const useFlowEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  const handleModalStateChange = useCallback((isOpen) => {
    setIsAnyModalOpen(isOpen);
  }, []);

  const handleNodeDataChange = useCallback((id, field, value) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? {
            ...node,
            data: {
              ...node.data,
              [field]: value,
              onChange: handleNodeDataChange,
            },
          }
          : node
      )
    );
  }, [setNodes]);

  const onConnect = useCallback((params) => {
    console.log("onConnect", params);
    const edgeType = checkConnectionType(
      nodes,
      edges,
      params.source,
      params.target,
      params.sourceHandle,
      params.targetHandle
    );
    if (edgeType) {
      setEdges((eds) => addEdge({ ...params, type: edgeType }, eds));
    }
  }, [nodes, setEdges, edges]);

  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedNodes(nodes);
    setSelectedEdges(edges);
  }, []);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    selectedNodes,
    selectedEdges,
    isAnyModalOpen,
    handleModalStateChange,
    handleNodeDataChange,
    onConnect,
    onSelectionChange
  };
};