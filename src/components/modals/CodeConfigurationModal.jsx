// src/components/modals/CodeConfigurationModal.jsx
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Editor from '@monaco-editor/react';
import './ConfigurationModal.css';

const CodeConfigurationModal = ({ 
  open,
  code,
  onChange,
  onSave,
  onCancel,
  onReset,
  title = "Configure Behaviour Code"
}) => {

  const handleEditorDidMount = (editor, monaco) => {
    // Register Python completion provider
    monaco.languages.registerCompletionItemProvider('python', {
      // Add trigger characters to show suggestions
      triggerCharacters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
      
      provideCompletionItems: function(model, position) {
        // Get the current line text up to cursor position
        const textBeforeCursor = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        // Get word being typed
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        // Filter suggestions based on what's being typed
        const currentWord = word.word.toLowerCase();
        
        // All Python suggestions
        const allSuggestions = [
          {
            label: 'await',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'await ${1:expression}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'await keyword',
            documentation: 'Wait for async operation to complete'
          },
          {
            label: 'async def',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'async def ${1:function_name}(${2:self}):\n    ${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'async function definition',
            documentation: 'Define an asynchronous function'
          },
          {
            label: 'async',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'async',
            detail: 'async keyword'
          },
          {
            label: 'and',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'and',
            detail: 'logical and operator'
          },
          {
            label: 'as',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'as',
            detail: 'alias keyword'
          },
          {
            label: 'assert',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'assert ${1:condition}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'assert statement'
          },
          {
            label: 'def',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'def ${1:function_name}(${2:self}):\n    ${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'function definition',
            documentation: 'Define a function'
          },
          {
            label: 'class',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'class ${1:ClassName}:\n    ${2:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'class definition'
          },
          {
            label: 'if',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'if ${1:condition}:\n    ${2:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'if statement'
          },
          {
            label: 'elif',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'elif ${1:condition}:\n    ${2:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'elif statement'
          },
          {
            label: 'else',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'else:\n    ${1:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'else statement'
          },
          {
            label: 'for',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'for ${1:item} in ${2:iterable}:\n    ${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'for loop'
          },
          {
            label: 'while',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'while ${1:condition}:\n    ${2:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'while loop'
          },
          {
            label: 'try',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'try:\n    ${1:pass}\nexcept ${2:Exception} as ${3:e}:\n    ${4:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'try-except block'
          },
          {
            label: 'except',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'except ${1:Exception} as ${2:e}:\n    ${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'except clause'
          },
          {
            label: 'finally',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'finally:\n    ${1:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'finally clause'
          },
          {
            label: 'with',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'with ${1:expression} as ${2:variable}:\n    ${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'with statement'
          },
          {
            label: 'import',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'import ${1:module}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'import statement'
          },
          {
            label: 'from',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'from ${1:module} import ${2:item}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'from import statement'
          },
          {
            label: 'return',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'return ${1:value}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'return statement'
          },
          {
            label: 'print',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'print(${1:"Hello World"})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'print function'
          },
          {
            label: 'len',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'len(${1:object})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'len function'
          },
          {
            label: 'str',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'str(${1:object})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'str function'
          },
          {
            label: 'int',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'int(${1:object})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'int function'
          },
          {
            label: 'self',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'self',
            detail: 'self reference'
          }
        ];

        // Filter suggestions based on current input
        const filteredSuggestions = allSuggestions.filter(suggestion => 
          suggestion.label.toLowerCase().startsWith(currentWord)
        );

        // Add range to each suggestion
        const suggestions = filteredSuggestions.map(suggestion => ({
          ...suggestion,
          range: range
        }));

        return { suggestions: suggestions };
      }
    });

    // Configure editor for proper autocompletion
    editor.updateOptions({
      // Quick suggestions configuration
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false
      },
      quickSuggestionsDelay: 10, // Show suggestions after 10ms
      
      // Suggest configuration
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      
      // Word-based suggestions
      wordBasedSuggestions: true,
      
      // Additional suggest options
      suggest: {
        filterGraceful: true,
        showKeywords: true,
        showSnippets: true,
        showClasses: true,
        showFunctions: true,
        showVariables: true,
        showWords: true,
        localityBonus: true
      }
    });

    // Force focus on editor to ensure suggestions work
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Type 'a' to see await, async suggestions. Use Ctrl+Space to manually trigger autocompletion.
          </Typography>
          
          <Box sx={{ 
            height: 'calc(100% - 60px)', 
            border: '1px solid #ccc', 
            borderRadius: '4px'
          }}>
            <Editor
              language="python"
              theme="vs-light"
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