// src/FlowEditor.jsx
import React, { useRef, useMemo, useEffect, useState } from "react";
import { ReactFlow, MiniMap, Controls, Background } from "@xyflow/react";
import { useSearchParams, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CodeIcon from '@mui/icons-material/Code';
import EditNoteIcon from '@mui/icons-material/EditNote';

import NodeToolBar from "../components/FlowEditToolBar/NodeToolBar";
import { useI18n } from "../i18n/I18nProvider";
import { useFlowEditor } from "../hooks/useFlowEditor";
import { useNodeOperations } from "../hooks/useNodeOperations";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useFileOperations } from "../hooks/useFileOperations";
import { useKeyboardHandlers } from "../hooks/useKeyboardHandlers";
import { createNodeTypes } from "../config/nodeTypes";
import { edgeTypes } from "../config/edgeTypes";
import { fetchExampleById } from '../services/examplesService';

import "@xyflow/react/dist/style.css";

export default function FlowEditor() {
  const { t } = useI18n();
  const reactFlowWrapper = useRef(null);
  const [searchParams] = useSearchParams();
  const [initialized, setInitialized] = useState(false);
  // Track UI mode to theme the canvas explicitly
  const [uiMode, setUiMode] = useState(() => document.documentElement?.dataset?.uiMode || 'light');
  const navigate = useNavigate();
  const [flowName, setFlowName] = useState("");
  const [flowDescription, setFlowDescription] = useState("");
  const [metaOpen, setMetaOpen] = useState(false);
  
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
  const { handleGenerateSpade, handleSave, handleLoad, loadProjectFromJson } = useFileOperations(
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

  // Si venimos desde la galería con ?example=..., cargar el flujo
  useEffect(() => {
    const ex = searchParams.get('example');
    if (initialized) return;
    setInitialized(true);
    if (ex) {
      (async () => {
        try {
          const projectData = await fetchExampleById(ex);
          loadProjectFromJson(projectData, { confirmIfNotEmpty: false });
          if (projectData?.name) setFlowName(projectData.name);
          if (projectData?.description) setFlowDescription(projectData.description);
        } catch (err) {
          console.error('Error loading example', err);
        }
      })();
    }
  }, [searchParams, initialized, loadProjectFromJson]);

  // Sync uiMode with global theme selector
  useEffect(() => {
    const applyFromDom = () => {
      const mode = document.documentElement?.dataset?.uiMode || 'light';
      setUiMode(mode);
    };
    const handleModeChanged = () => applyFromDom();
    const handleStorage = (e) => {
      if (e.key === 'ui.mode') applyFromDom();
    };
    window.addEventListener('ui-mode-changed', handleModeChanged);
    window.addEventListener('storage', handleStorage);
    applyFromDom();
    return () => {
      window.removeEventListener('ui-mode-changed', handleModeChanged);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const saveWithMeta = () => {
    const fileName = flowName && flowName.trim().length > 0 ? flowName.trim() : undefined;
    handleSave({ fileName, metadata: { name: flowName || undefined, description: flowDescription || undefined } });
  };

  const handleBackToHome = () => {
    if (nodes.length > 0) {
      const save = window.confirm(t('editor.confirmLeave'));
      if (save) {
        try { saveWithMeta(); } catch (e) {}
      }
    }
    navigate('/');
  };

  return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>
        {/* Top AppBar for editor actions */}
        <AppBar position="static" color="primary" elevation={1}>
          <Toolbar>
            <Tooltip title={t('editor.backToHome')}>
              <span>
                <IconButton color="inherit" onClick={handleBackToHome} aria-label="back-to-home">
                  <ArrowBackIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Typography variant="h6" component="div" sx={{ ml: 1 }}>
              {t('editor.title')}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title={t('editor.editMeta')}>
              <span>
                <IconButton color="inherit" onClick={() => setMetaOpen(true)} aria-label="edit-meta">
                  <EditNoteIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t('editor.generateCode')}>
              <span>
                <IconButton color="inherit" onClick={handleGenerateSpade} disabled={isAnyModalOpen} aria-label="generate-code">
                  <CodeIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t('editor.saveFlow')}>
              <span>
                <IconButton color="inherit" onClick={saveWithMeta} disabled={isAnyModalOpen} aria-label="save-flow">
                  <SaveIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t('editor.loadFlow')}>
              <span>
                <IconButton color="inherit" onClick={handleLoad} disabled={isAnyModalOpen} aria-label="load-flow">
                  <FolderOpenIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Body: Node toolbar + canvas */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        >
          <NodeToolBar
            onDragStart={onDragStart}
            onGenerateSpade={handleGenerateSpade}
            onSave={handleSave}
            onLoad={handleLoad}
            modalBlocked={isAnyModalOpen}
          />

          <div
            ref={reactFlowWrapper}
            style={{ flex: 1, height: "100%", background: 'var(--surface-bg)' }}
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
              <Background
                variant="dots"
                gap={12}
                size={1}
              />
            </ReactFlow>
          </div>
        </div>
        {/* Dialog metadata */}
        <Dialog open={metaOpen} onClose={() => setMetaOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>{t('editor.metaDialogTitle')}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label={t('editor.name')}
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                fullWidth
              />
              <TextField
                label={t('editor.description')}
                value={flowDescription}
                onChange={(e) => setFlowDescription(e.target.value)}
                fullWidth
                multiline
                minRows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMetaOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => { setMetaOpen(false); }} variant="contained">{t('common.save')}</Button>
          </DialogActions>
        </Dialog>
      </div>
  );
}