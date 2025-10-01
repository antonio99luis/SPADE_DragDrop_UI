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
    // Register Python completion provider with control characters
    monaco.languages.registerCompletionItemProvider('python', {
      // Add control characters as triggers
      triggerCharacters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '$', '@', '.'],

      provideCompletionItems: function (model, position) {
        // Get the text before cursor
        const textBeforeCursor = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        // Get word being typed
        const word = model.getWordUntilPosition(position);
        let range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const currentWord = word.word.toLowerCase();

        // Control character suggestions
        const controlCharacterSuggestions = {
          // $ for SPADE agent variables and properties
          '$': [
            {
              label: '$agent',
              kind: monaco.languages.CompletionItemKind.Variable,
              insertText: 'self.agent',
              detail: 'Reference to parent agent',
              documentation: 'Access to the parent agent instance'
            },
            {
              label: '$template',
              kind: monaco.languages.CompletionItemKind.Variable,
              insertText: 'self.template',
              detail: 'Message template',
              documentation: 'Template for filtering messages'
            },
            {
              label: '$presence',
              kind: monaco.languages.CompletionItemKind.Variable,
              insertText: 'self.presence',
              detail: 'Presence manager',
              documentation: 'Agent presence manager for subscription handling'
            },
            {
              label: '$is_running',
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: 'self.is_running()',
              detail: 'Check if behavior is running',
              documentation: 'Returns True if the behavior is currently running'
            },
            {
              label: '$web',
              kind: monaco.languages.CompletionItemKind.Variable,
              insertText: 'self.web',
              detail: 'Web interface',
              documentation: 'Web interface manager for HTTP endpoints'
            },
            {
              label: '$exit_code',
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: 'self.exit_code',
              detail: 'Behavior exit code',
              documentation: 'The exit code of the behavior'
            }
          ],

          // @ for SPADE behavior methods
          '@': [
            {
              label: '@send',
              kind: monaco.languages.CompletionItemKind.Method,
              insertText: 'await self.send(${1:message})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: 'Send a message',
              documentation: 'Sends a message to another agent'
            },
            {
              label: '@receive',
              kind: monaco.languages.CompletionItemKind.Method,
              insertText: 'msg = await self.receive(${1:timeout})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: 'Receive a message',
              documentation: 'Receives a message with optional timeout'
            },
            {
              label: '@set',
              kind: monaco.languages.CompletionItemKind.Method,
              insertText: 'self.set("${1:key}", ${2:value})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: 'Set knowledge',
              documentation: 'Stores knowledge in agent knowledge base'
            },
            {
              label: '@get',
              kind: monaco.languages.CompletionItemKind.Method,
              insertText: 'self.get("${1:key}")',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: 'Get knowledge',
              documentation: 'Retrieves knowledge from agent knowledge base'
            },
            {
              label: '@kill',
              kind: monaco.languages.CompletionItemKind.Method,
              insertText: 'self.kill(${1:exit_code})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: 'Kill the behavior',
              documentation: 'Stops the behavior execution'
            },
            {
              label: '@match',
              kind: monaco.languages.CompletionItemKind.Method,
              insertText: 'if msg and msg.match(${1:template}):\n    ${2:# Handle message}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: 'Match message template',
              documentation: 'Check if message matches a template'
            },
            {
              label: '@set_agent',
              kind: monaco.languages.CompletionItemKind.Method,
              insertText: 'self.set_agent(${1:agent})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: 'Set behavior agent',
              documentation: 'Sets the agent for this behavior'
            },
            {
              label: '@add_behaviour',
              kind: monaco.languages.CompletionItemKind.Method,
              insertText: 'self.agent.add_behaviour(${1:behaviour})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: 'Add behavior to agent',
              documentation: 'Adds a new behavior to the agent'
            }
          ]
        };

        // Standard Python suggestions
        const pythonSuggestions = [
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
            label: 'def',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'def ${1:function_name}(${2:self}):\n    ${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'function definition',
            documentation: 'Define a function'
          },
          {
            label: 'if',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'if ${1:condition}:\n    ${2:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'if statement'
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
            label: 'print',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'print(${1:"Hello World"})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'print function'
          },
          {
            label: 'return',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'return ${1:value}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'return statement'
          }
        ];

        // Self dot completions
        const selfCompletions = [
          {
            label: 'send',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'send(${1:message})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Send a message',
            documentation: 'Sends a message to another agent'
          },
          {
            label: 'receive',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'receive(${1:timeout})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Receive a message',
            documentation: 'Receives a message with optional timeout'
          },
          {
            label: 'set',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'set("${1:key}", ${2:value})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Set knowledge',
            documentation: 'Stores knowledge in agent knowledge base'
          },
          {
            label: 'get',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'get("${1:key}")',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Get knowledge',
            documentation: 'Retrieves knowledge from agent knowledge base'
          },
          {
            label: 'agent',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'agent',
            detail: 'Reference to parent agent',
            documentation: 'Access to the parent agent instance'
          },
          {
            label: 'presence',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'presence',
            detail: 'Presence manager',
            documentation: 'Agent presence manager for subscription handling'
          },
          {
            label: 'kill',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'kill(${1:exit_code})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Kill the behavior',
            documentation: 'Stops the behavior execution'
          }
        ];

        let suggestions = [];

        // Check for control characters
        if (textBeforeCursor.endsWith('$')) {
          suggestions = controlCharacterSuggestions['$'];
          range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column - 1, // Include the @ character
            endColumn: position.column,
          };
        } else if (textBeforeCursor.endsWith('@')) {
          suggestions = controlCharacterSuggestions['@'];
          range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column - 1, // Include the @ character
            endColumn: position.column,
          };
        }
        // Check for self. completions
        else if (textBeforeCursor.endsWith('self.')) {
          suggestions = selfCompletions;
        }
        // Regular Python completions
        else {
          // Filter based on current word
          suggestions = pythonSuggestions.filter(suggestion =>
            suggestion.label.toLowerCase().startsWith(currentWord)
          );
        }

        // Add range to each suggestion
        const finalSuggestions = suggestions.map(suggestion => ({
          ...suggestion,
          range: range
        }));

        return { suggestions: finalSuggestions };
      }
    });

    // Configure editor for proper autocompletion
    editor.updateOptions({
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false
      },
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
        localityBonus: true
      }
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Type '$' for agent properties, '@' for behavior methods, or 'self.' for behavior instance methods.
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
            <Button variant="outlined" onClick={onReset}>
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