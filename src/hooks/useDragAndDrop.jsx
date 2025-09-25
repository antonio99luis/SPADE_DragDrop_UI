// src/hooks/useDragAndDrop.js
import { useCallback } from "react";
import { createNodeData } from "../commons/flowUtils";

export const useDragAndDrop = (setNodes, nodes, handleNodeDataChange, handleModalStateChange) => {
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

  const onDragStart = useCallback((event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  }, []);

  return { onDrop, onDragOver, onDragStart };
};