// src/hooks/useNodeOperations.js
import { useCallback } from "react";

export const useNodeOperations = (setNodes, setEdges) => {
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

  const onEdgesDelete = useCallback(
    (deleted) => {
      setEdges((eds) =>
        eds.filter((edge) => !deleted.some((d) => d.id === edge.id))
      );
    },
    [setEdges]
  );

  return { onNodesDelete, onEdgesDelete };
};