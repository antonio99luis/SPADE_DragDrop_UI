// src/FlowEditor.jsx
import React, { useRef, useMemo } from "react";
import { ThemeProvider } from '@mui/material/styles';
import { ReactFlow, MiniMap, Controls, Background } from "@xyflow/react";

import theme from './theme';
import NodeToolbar from "./components/ui/NodeToolbar";
import { useFlowEditor } from "./hooks/useFlowEditor";
import { useNodeOperations } from "./hooks/useNodeOperations";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useFileOperations } from "./hooks/useFileOperations";
import { useKeyboardHandlers } from "./hooks/useKeyboardHandlers";
import { createNodeTypes } from "./config/nodeTypes";
import { edgeTypes } from "./config/edgeTypes";

import "@xyflow/react/dist/style.css";

export default function FlowEditor() {
  const reactFlowWrapper = useRef(null);
  
  // Core flow state and handlers
  const {
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
  } = useFlowEditor();

  // Node operations (delete, etc.)
  const { onNodesDelete, onEdgesDelete } = useNodeOperations(setNodes, setEdges);

  // Drag and drop functionality
  const { onDrop, onDragOver, onDragStart } = useDragAndDrop(
    setNodes, 
    nodes, 
    handleNodeDataChange, 
    handleModalStateChange
  );

  // File operations
  const { handleGenerateSpade, handleSave, handleLoad } = useFileOperations(
    nodes, 
    edges, 
    setNodes, 
    setEdges, 
    handleNodeDataChange, 
    handleModalStateChange
  );

  // Keyboard handlers
  useKeyboardHandlers(
    selectedNodes,
    selectedEdges,
    onNodesDelete,
    onEdgesDelete,
    isAnyModalOpen
  );

  // Memoized node types
  const nodeTypes = useMemo(
    () => createNodeTypes(handleModalStateChange),
    [handleModalStateChange]
  );

  return (
    <ThemeProvider theme={theme}>
      <div
        style={{
          display: "flex",
          width: "100vw",
          height: "100vh",
          position: "relative",
        }}
      >
        <NodeToolbar
          onDragStart={onDragStart}
          onGenerateSpade={handleGenerateSpade}
          onSave={handleSave}
          onLoad={handleLoad}
          modalBlocked={isAnyModalOpen}
        />

        <div
          ref={reactFlowWrapper}
          style={{ flex: 1, height: "100%" }}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onSelectionChange={onSelectionChange}
            nodesDraggable={!isAnyModalOpen}
            nodesConnectable={!isAnyModalOpen}
            elementsSelectable={!isAnyModalOpen}
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>
    </ThemeProvider>
  );
}