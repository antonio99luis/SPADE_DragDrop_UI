import React, { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from "@xyflow/react";
import { generateSpadeCode } from './utils/codeGenerator';
import { NODE_TYPES,EDGE_TYPES, HANDLE_KEYS, DEFAULTS } from "./commons/constants";
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


const initialNodes = [];
const initialEdges = [];

const nodeTypes = {
  agent: AgentNode,
  behaviour: BehaviourNode,
  template: TemplateNode,
  stickyNote: StickyNoteNode,
};

const edgeTypes = {
  friendship: FriendshipEdge,
  agentBehaviour: AgentBehaviourEdge,
  inheritance: InheritanceEdge,
  template: TemplateEdge,
};

function getNextAgentNumber(nodes) {
  const usedNumbers = nodes
    .filter((n) => n.type === NODE_TYPES.AGENT)
    .map((n) => {
      const match = (n.data.class || "").match(/^MyAgent(\d+)$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n) => n !== null)
    .sort((a, b) => a - b);

  for (let i = 1; i <= usedNumbers.length + 1; i++) {
    if (!usedNumbers.includes(i)) return i;
  }
  return 1;
}

function getNextBehaviourNumber(nodes) {
  const usedNumbers = nodes
    .filter((n) => n.type === NODE_TYPES.BEHAVIOUR)
    .map((n) => {
      const match = (n.data.class || "").match(/^MyBehaviour(\d+)$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n) => n !== null)
    .sort((a, b) => a - b);

  for (let i = 1; i <= usedNumbers.length + 1; i++) {
    if (!usedNumbers.includes(i)) return i;
  }
  return 1;
}

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  // Move this function BEFORE onDrop
  const handleModalStateChange = useCallback((isOpen) => {
    setIsAnyModalOpen(isOpen);
  }, []);

  // This handler already supports updating any field
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
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      // Friendship: agent to agent, both use 'friendship' handle
      if (
        sourceNode?.type === NODE_TYPES.AGENT &&
        targetNode?.type === NODE_TYPES.AGENT &&
        params.sourceHandle === HANDLE_KEYS.FRIENDSHIP_SOURCE &&
        params.targetHandle === HANDLE_KEYS.FRIENDSHIP_TARGET &&
        params.source !== params.target
      ) {
        setEdges((eds) => addEdge({ ...params, type: EDGE_TYPES.FRIENDSHIP }, eds));
      }
      // AgentBehaviour: agent (source, 'behaviour') to behaviour (target, 'behaviour')
      else if (
        sourceNode?.type === NODE_TYPES.AGENT &&
        targetNode?.type === NODE_TYPES.BEHAVIOUR &&
        params.sourceHandle === HANDLE_KEYS.BEHAVIOUR &&
        params.targetHandle === HANDLE_KEYS.BEHAVIOUR
      ) {
        setEdges((eds) => addEdge({ ...params, type: EDGE_TYPES.AGENT_BEHAVIOUR }, eds));
      }
      // Inheritance: agent to agent, both use 'inheritance' handle
      else if (
        sourceNode?.type === NODE_TYPES.AGENT &&
        targetNode?.type === NODE_TYPES.AGENT &&
        params.sourceHandle === HANDLE_KEYS.INHERITANCE_SOURCE &&
        params.targetHandle === HANDLE_KEYS.INHERITANCE_TARGET
      ) {
        // Only allow one outgoing inheritance edge per source
        const alreadyHasInheritance = edges.some(
          (e) =>
            e.source === params.source &&
            e.sourceHandle === HANDLE_KEYS.INHERITANCE_SOURCE &&
            e.type === EDGE_TYPES.INHERITANCE
        );
        if (!alreadyHasInheritance) {
          setEdges((eds) =>
            addEdge(
              {
                ...params,
                type: EDGE_TYPES.INHERITANCE,
                markerStart: {
                  type: MarkerType.ArrowClosed,
                  orient: 'auto-start-reverse',
                  width: 20,
                  height: 20,
                },
              },
              eds
            )
          );
        }
      }
      // TemplateEdge: behaviour (source, 'template') to template (target, 'template')
      else if (
        sourceNode?.type === NODE_TYPES.BEHAVIOUR &&
        targetNode?.type === NODE_TYPES.TEMPLATE &&
        params.sourceHandle === HANDLE_KEYS.TEMPLATE &&
        params.targetHandle === HANDLE_KEYS.TEMPLATE
      ) {
        // Only allow one outgoing template edge per behaviour node
        const alreadyHasTemplate = edges.some(
          (e) =>
            e.source === params.source &&
            e.sourceHandle === HANDLE_KEYS.TEMPLATE &&
            e.type === EDGE_TYPES.TEMPLATE
        );
        if (!alreadyHasTemplate) {
          setEdges((eds) => addEdge({ ...params, type: NODE_TYPES.TEMPLATE }, eds));
        }
      }
      // Prevent all other connections
      else {
        // Optionally, show a warning or ignore
      }
    },
    [nodes, setEdges, edges]
  );

  // When creating agent nodes, initialize the new "class" field
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const id = `${type}-${+new Date()}`;

      let data;
      if (type === NODE_TYPES.AGENT) {
        const nextNum = getNextAgentNumber(nodes);
        data = {
          class: `MyAgent${nextNum}`,
          name: `agent${nextNum}`,
          host: DEFAULTS.HOST,
          title: "Agent", // Add default title
          onChange: handleNodeDataChange,
          onModalStateChange: handleModalStateChange,
        };
      } else if (type === NODE_TYPES.BEHAVIOUR) {
        const nextNum = getNextBehaviourNumber(nodes);
        data = {
          class: `MyBehaviour${nextNum}`,
          type: DEFAULTS.BEHAVIOUR_TYPE,
          period: "",
          start_at: "",
          onChange: handleNodeDataChange,
          onModalStateChange: handleModalStateChange, // Add this
        };
      } else if (type === NODE_TYPES.TEMPLATE) {
        data = {
          sender: "",
          to: "",
          body: "",
          thread: "",
          metadataCode: "{}",
          onChange: handleNodeDataChange,
          onModalStateChange: handleModalStateChange, // Add this
        };
      } else if (type === NODE_TYPES.STICKY_NOTE) {
        data = {
          text: "",
          onChange: handleNodeDataChange,
          onModalStateChange: handleModalStateChange, // Add this
        };
      } else {
        data = {
          onModalStateChange: handleModalStateChange, // Add this
        };
      }

      setNodes((nds) =>
        nds.concat({
          id,
          type,
          position,
          data,
        })
      );
    },
    [setNodes, nodes, handleNodeDataChange, handleModalStateChange] // Add handleModalStateChange to dependencies
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Always inject onChange for agent and behaviour nodes
  const nodesWithHandlers = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onChange: handleNodeDataChange,
      onModalStateChange: handleModalStateChange, // Add to ALL nodes
    },
  }));

  // Handler for selection changes
  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedNodes(nodes);
    setSelectedEdges(edges);
  }, []);

  // Handler for deleting nodes
  const onNodesDelete = useCallback(
    (deleted) => {
      // Remove the deleted nodes
      setNodes((nds) =>
        nds.filter((node) => !deleted.some((d) => d.id === node.id))
      );

      // Remove edges associated with the deleted nodes
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
      // Prevent node deletion if focus is on an input, textarea, or contenteditable element
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
    
    // Trigger download
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
    if (!fileName) return; // User cancelled

    const projectData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      nodes: nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          // Remove the onChange function from saved data
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
    // Check if canvas is not empty
    if (nodes.length > 0 || edges.length > 0) {
      const confirmed = window.confirm(
        "Are you sure you want to load a new project?\n\n" +
        "This will replace all current canvas content.\n" +
        "Consider saving your current work before continuing."
      );
      if (!confirmed) return;
    }

    // Create file input element
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
          
          // Validate file format
          if (!projectData.version || !projectData.nodes || !projectData.edges) {
            alert("Error: The file does not have a valid format.");
            return;
          }

          // Restore nodes with onChange handler
          const restoredNodes = projectData.nodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              onChange: handleNodeDataChange
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
  }, [nodes, edges, setNodes, setEdges, handleNodeDataChange]);

  return (
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
          nodes={nodesWithHandlers}
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
  );
}
