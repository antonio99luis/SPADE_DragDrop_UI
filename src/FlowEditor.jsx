// src/FlowEditor.jsx
import React, { useCallback, useRef, useState, useMemo } from "react";
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme'; 

import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge
} from "@xyflow/react";
import { generateSpadeCode } from './utils/codeGenerator';
import {DEFAULTS } from "./commons/constants";
import AgentNode from "./components/nodes/agent/AgentNode";
import BehaviourNode from "./components/nodes/behaviour/BehaviourNode";
import TemplateNode from "./components/nodes/template/TemplateNode";
import StickyNoteNode from "./components/nodes/sticky-note/StickyNoteNode";

import FriendshipEdge from "./components/edges/FriendshipEdge";
import AgentBehaviourEdge from "./components/edges/AgentBehaviourEdge";
import InheritanceEdge from "./components/edges/InheritanceEdge";
import TemplateEdge from "./components/edges/TemplateEdge";

import NodeToolbar from "./components/ui/NodeToolbar";
import "@xyflow/react/dist/style.css";
import {checkConnectionType, createNodeData} from "./commons/flowUtils";

const initialNodes = [];
const initialEdges = [];

const edgeTypes = {
  friendship: FriendshipEdge,
  agentBehaviour: AgentBehaviourEdge,
  inheritance: InheritanceEdge,
  template: TemplateEdge,
};

export default function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  const handleModalStateChange = useCallback((isOpen) => {
    setIsAnyModalOpen(isOpen);
  }, []);

  const nodeTypes = useMemo(() => ({
    agent: (props) => (
      <AgentNode 
        {...props} 
        data={{
          ...props.data,
          onModalStateChange: handleModalStateChange
        }}
      />
    ),
    behaviour: (props) => (
      <BehaviourNode 
        {...props} 
        data={{
          ...props.data,
          onModalStateChange: handleModalStateChange
        }}
      />
    ),
    template: (props) => (
      <TemplateNode 
        {...props} 
        data={{
          ...props.data,
          onModalStateChange: handleModalStateChange
        }}
      />
    ),
    stickyNote: (props) => (
      <StickyNoteNode 
        {...props} 
        data={{
          ...props.data,
          onModalStateChange: handleModalStateChange
        }}
      />
    ),
  }), [handleModalStateChange]);

  const handleNodeDataChange = (id, field, value) => {
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
  };

  const onConnect = useCallback(
    (params) => {
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
    },
    [nodes, setEdges, edges]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const id = `${type}-${Date.now()}`;
      const data = createNodeData(type, nodes, handleNodeDataChange, handleModalStateChange);

      setNodes((nds) => nds.concat({ id, type, position, data }));
    },
    [setNodes, nodes, handleNodeDataChange, handleModalStateChange]
  ); 

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Handler for selection changes
  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedNodes(nodes);
    setSelectedEdges(edges);
  }, []);

  // Handler for deleting nodes
  const onNodesDelete = useCallback(
    (deleted) => {
      setNodes((nds) =>
        nds.filter((node) => !deleted.some((d) => d.id === node.id))
      );

      setEdges((eds) =>
        eds.filter(
          (edge) =>
            !deleted.some((d) => d.id === edge.source || d.id === edge.target)
        )
      );
    },
    [setNodes, setEdges]
  );

  // Handler for deleting edges
  const onEdgesDelete = useCallback(
    (deleted) => {
      setEdges((eds) =>
        eds.filter((edge) => !deleted.some((d) => d.id === edge.id))
      );
    },
    [setEdges]
  );

  // Listen for delete key
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      console.log('Key pressed:', event.key, 'Modal open:', isAnyModalOpen);
      
      if (isAnyModalOpen) {
        console.log('Prevented deletion - modal is open');
        return;
      }

      const tag = event.target.tagName?.toLowerCase();
      const isEditable = event.target.isContentEditable;
      if (tag === "input" || tag === "textarea" || isEditable) {
        return; // Do nothing, let the input handle the key
      }

      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        (selectedNodes.length > 0 || selectedEdges.length > 0)
      ) {
        if (
          window.confirm(
            "Are you sure you want to delete the selected item(s)?"
          )
        ) {
          if (selectedNodes.length > 0) onNodesDelete(selectedNodes);
          if (selectedEdges.length > 0) onEdgesDelete(selectedEdges);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodes, selectedEdges, onNodesDelete, onEdgesDelete]);

  const handleGenerateSpade = () => {
    const finalCode = generateSpadeCode(nodes, edges);

    const blob = new Blob([finalCode], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = DEFAULTS.GENERATED_FILE_NAME;
    a.click();
    URL.revokeObjectURL(url);
  };

  function onDragStart(event, nodeType) {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  }

  const handleSave = useCallback(() => {
    const fileName = prompt("File name:", DEFAULTS.PROJECT_FILE_NAME);
    if (!fileName) return;

    const projectData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      nodes: nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onChange: undefined
        }
      })),
      edges: edges
    };

    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const handleLoad = useCallback(() => {
    if (nodes.length > 0 || edges.length > 0) {
      const confirmed = window.confirm(
        "Are you sure you want to load a new project?\n\n" +
        "This will replace all current canvas content.\n" +
        "Consider saving your current work before continuing."
      );
      if (!confirmed) return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const projectData = JSON.parse(e.target.result);

          if (!projectData.version || !projectData.nodes || !projectData.edges) {
            alert("Error: The file does not have a valid format.");
            return;
          }

          const restoredNodes = projectData.nodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              onChange: handleNodeDataChange,
              onModalStateChange: handleModalStateChange
            }
          }));

          setNodes(restoredNodes);
          setEdges(projectData.edges);

          alert(`Project loaded successfully!\nCreation date: ${new Date(projectData.timestamp).toLocaleString()}`);
        } catch (error) {
          alert("Error: Could not read the file. Make sure it is a valid JSON file.");
          console.error("Error loading file:", error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [nodes, edges, setNodes, setEdges, handleNodeDataChange, handleModalStateChange]);

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
            nodesDraggable={!isAnyModalOpen} // Disable dragging when modal is open
            nodesConnectable={!isAnyModalOpen} // Disable connections when modal is open
            elementsSelectable={!isAnyModalOpen} // Disable selection when modal is open
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