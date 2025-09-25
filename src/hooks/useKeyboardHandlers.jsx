// src/hooks/useKeyboardHandlers.js
import { useEffect } from "react";

export const useKeyboardHandlers = (
  selectedNodes,
  selectedEdges,
  onNodesDelete,
  onEdgesDelete,
  isAnyModalOpen
) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      console.log('Key pressed:', event.key, 'Modal open:', isAnyModalOpen);
      
      if (isAnyModalOpen) {
        console.log('Prevented deletion - modal is open');
        return;
      }

      const tag = event.target.tagName?.toLowerCase();
      const isEditable = event.target.isContentEditable;
      if (tag === "input" || tag === "textarea" || isEditable) {
        return;
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
  }, [selectedNodes, selectedEdges, onNodesDelete, onEdgesDelete, isAnyModalOpen]);
};