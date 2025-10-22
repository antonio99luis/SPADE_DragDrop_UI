// src/components/modals/CodeConfigurationModal.jsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Editor from '@monaco-editor/react';
import './ConfigurationModal.css';
import { buildPythonCompletionProvider } from '../../editor/providers/pythonProvider';
import { registerCustomLanguage } from '../../editor/customLanguage';

const CodeConfigurationModal = ({
  open,
  code,
  onChange,
  onSave,
  onCancel,
  onReset,
  title = "Configure Behaviour Code",
  language = 'python',
  theme = 'vs-light',
  helperText,
  editorOptions = {},
  buildCompletionProvider,
  customSyntax, // { id, monarch, conf, aliases }
  defaultCode, // optional: when provided, Reset will also fill editor with this
}) => {
  const completionDisposableRef = useRef(null);


  const handleEditorDidMount = (editor, monaco) => {
    // Dispose any previous provider to avoid duplicates
    if (completionDisposableRef.current) {
      try { completionDisposableRef.current.dispose(); } catch {}
      completionDisposableRef.current = null;
    }

    // Optionally register a custom language syntax before attaching providers
    if (customSyntax && customSyntax.id) {
      registerCustomLanguage(monaco, customSyntax);
    }

    // Register completion provider if applicable
    if (buildCompletionProvider) {
      const provider = buildCompletionProvider(monaco);
      if (provider && language) {
        completionDisposableRef.current = monaco.languages.registerCompletionItemProvider(language, provider);
      }
    } else if (language === 'python') {
      completionDisposableRef.current = monaco.languages.registerCompletionItemProvider('python', buildPythonCompletionProvider(monaco));
    }

    // Configure editor for proper autocompletion
    editor.updateOptions({
      quickSuggestions: { other: true, comments: false, strings: false },
      quickSuggestionsDelay: 10,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      wordBasedSuggestions: true,
      suggest: {
        filterGraceful: true,
        showKeywords: true,
        showSnippets: true,
        showClasses: true,
        showFunctions: true,
        showVariables: true,
        showWords: true,
        localityBonus: true,
      },
      ...editorOptions,
    });

    editor.focus();
  };

  // Close on ESC key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="node-setup-modal-backdrop" onClick={onCancel}>
      <div
        className="node-setup-modal-content"
        style={{ width: "90%", maxWidth: "1200px", height: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="node-setup-modal-header">
          <h2 className="node-setup-modal-title">{title}</h2>
          <button
            className="node-setup-modal-close"
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        <div className="node-setup-modal-body" style={{ height: 'calc(100% - 80px)' }}>
          {(helperText ?? language === 'python') && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {helperText ?? "Type '$' for agent properties, '@' for behavior methods, or 'self.' for behavior instance methods."}
            </Typography>
          )}

          <Box sx={{
            height: 'calc(90% - 60px)',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}>
            <Editor
              language={language}
              theme={theme}
              value={code}
              onChange={onChange}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
                wordWrap: 'on',
                scrollBeyondLastLine: false
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                if (onReset) onReset();
                // If a default code is provided, ensure the editor shows it even when current code is empty
                if (defaultCode !== undefined && onChange) {
                  onChange(defaultCode);
                }
              }}
            >
              Reset Code
            </Button>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="contained" onClick={onSave}>
              Save
            </Button>
          </Box>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CodeConfigurationModal;