// src/hooks/useFileOperations.js
import { useCallback } from "react";
import { generateSpadeCode } from "../utils/codeGenerator";
import { DEFAULTS } from "../commons/constants";
import JSZip from "jszip";

export const useFileOperations = (nodes, edges, setNodes, setEdges, handleNodeDataChange, handleModalStateChange) => {
  const handleGenerateSpade = useCallback(async () => {
    const result = generateSpadeCode(nodes, edges);

    // Always create a ZIP and download it (handles both object and legacy string outputs)
    const zip = new JSZip();

    if (typeof result === 'string') {
      // Legacy path: single file content only
      zip.file(DEFAULTS.GENERATED_FILE_NAME, result);
    } else {
      const { mainFileName, mainCode, extraFiles } = result || {};
      // Add main file
      zip.file(mainFileName || DEFAULTS.GENERATED_FILE_NAME, mainCode || '');
      // Add extra files if any
      (extraFiles || []).forEach((f) => {
        const name = f?.name || "extra.txt";
        const content = typeof f?.content === 'string' ? f.content : '';
        zip.file(name, content);
      });
    }

    // Generate and trigger download
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spade_project.zip";
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

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

  // Carga directa a partir de un objeto JSON de proyecto (por ejemplo, desde la galería de ejemplos)
  const loadProjectFromJson = useCallback((projectData, { confirmIfNotEmpty = false } = {}) => {
    if (!projectData || !projectData.nodes || !projectData.edges) {
      console.error('Invalid project data');
      return false;
    }

    if (confirmIfNotEmpty && (nodes.length > 0 || edges.length > 0)) {
      const confirmed = window.confirm(
        'This will replace current canvas content. Continue?'
      );
      if (!confirmed) return false;
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
    return true;
  }, [nodes, edges, setNodes, setEdges, handleNodeDataChange, handleModalStateChange]);

  return { handleGenerateSpade, handleSave, handleLoad, loadProjectFromJson };
};