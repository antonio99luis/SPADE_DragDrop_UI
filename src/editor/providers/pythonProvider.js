// src/editor/providers/pythonProvider.js
// Exports a builder for Monaco completion provider suited for SPADE Python snippets
export function buildPythonCompletionProvider(monaco) {
  return {
    triggerCharacters: [
      'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
      '$','@','.'
    ],
    provideCompletionItems: (model, position) => {
      const textBeforeCursor = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const word = model.getWordUntilPosition(position);
      let range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const currentWord = (word.word || '').toLowerCase();

      const controlCharacterSuggestions = {
        '$': [
          { label: '$agent', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'self.agent', detail: 'Reference to parent agent', documentation: 'Access to the parent agent instance' },
          { label: '$template', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'self.template', detail: 'Message template', documentation: 'Template for filtering messages' },
          { label: '$presence', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'self.presence', detail: 'Presence manager', documentation: 'Agent presence manager for subscription handling' },
          { label: '$is_running', kind: monaco.languages.CompletionItemKind.Property, insertText: 'self.is_running()', detail: 'Check if behavior is running', documentation: 'Returns True if the behavior is currently running' },
          { label: '$web', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'self.web', detail: 'Web interface', documentation: 'Web interface manager for HTTP endpoints' },
          { label: '$exit_code', kind: monaco.languages.CompletionItemKind.Property, insertText: 'self.exit_code', detail: 'Behavior exit code', documentation: 'The exit code of the behavior' },
        ],
        '@': [
          { label: '@send', kind: monaco.languages.CompletionItemKind.Method, insertText: 'await self.send(${1:message})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Send a message', documentation: 'Sends a message to another agent' },
          { label: '@receive', kind: monaco.languages.CompletionItemKind.Method, insertText: 'msg = await self.receive(${1:timeout})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Receive a message', documentation: 'Receives a message with optional timeout' },
          { label: '@set', kind: monaco.languages.CompletionItemKind.Method, insertText: 'self.set("${1:key}", ${2:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Set knowledge', documentation: 'Stores knowledge in agent knowledge base' },
          { label: '@get', kind: monaco.languages.CompletionItemKind.Method, insertText: 'self.get("${1:key}")', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Get knowledge', documentation: 'Retrieves knowledge from agent knowledge base' },
          { label: '@kill', kind: monaco.languages.CompletionItemKind.Method, insertText: 'self.kill(${1:exit_code})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Kill the behavior', documentation: 'Stops the behavior execution' },
          { label: '@match', kind: monaco.languages.CompletionItemKind.Method, insertText: 'if msg and msg.match(${1:template}):\n    ${2:# Handle message}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Match message template', documentation: 'Check if message matches a template' },
          { label: '@set_agent', kind: monaco.languages.CompletionItemKind.Method, insertText: 'self.set_agent(${1:agent})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Set behavior agent', documentation: 'Sets the agent for this behavior' },
          { label: '@add_behaviour', kind: monaco.languages.CompletionItemKind.Method, insertText: 'self.agent.add_behaviour(${1:behaviour})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Add behavior to agent', documentation: 'Adds a new behavior to the agent' },
        ],
      };

      const pythonSuggestions = [
        { label: 'await', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'await ${1:expression}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'await keyword', documentation: 'Wait for async operation to complete' },
        { label: 'async def', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'async def ${1:function_name}(${2:self}):\n    ${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'async function definition', documentation: 'Define an asynchronous function' },
        { label: 'def', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'def ${1:function_name}(${2:self}):\n    ${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'function definition', documentation: 'Define a function' },
        { label: 'if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'if ${1:condition}:\n    ${2:pass}' },
        { label: 'for', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'for ${1:item} in ${2:iterable}:\n    ${3:pass}' },
        { label: 'while', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'while ${1:condition}:\n    ${2:pass}' },
        { label: 'try', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'try:\n    ${1:pass}\nexcept ${2:Exception} as ${3:e}:\n    ${4:pass}' },
        { label: 'print', kind: monaco.languages.CompletionItemKind.Function, insertText: 'print(${1:"Hello World"})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
        { label: 'return', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'return ${1:value}' },
      ];

      const selfCompletions = [
        { label: 'send', kind: monaco.languages.CompletionItemKind.Method, insertText: 'send(${1:message})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Send a message' },
        { label: 'receive', kind: monaco.languages.CompletionItemKind.Method, insertText: 'receive(${1:timeout})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Receive a message' },
        { label: 'set', kind: monaco.languages.CompletionItemKind.Method, insertText: 'set("${1:key}", ${2:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
        { label: 'get', kind: monaco.languages.CompletionItemKind.Method, insertText: 'get("${1:key}")', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
        { label: 'agent', kind: monaco.languages.CompletionItemKind.Property, insertText: 'agent' },
        { label: 'presence', kind: monaco.languages.CompletionItemKind.Property, insertText: 'presence' },
        { label: 'kill', kind: monaco.languages.CompletionItemKind.Method, insertText: 'kill(${1:exit_code})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
      ];

      let suggestions = [];

      if (textBeforeCursor.endsWith('$')) {
        suggestions = controlCharacterSuggestions['$'];
        range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: position.column - 1, endColumn: position.column };
      } else if (textBeforeCursor.endsWith('@')) {
        suggestions = controlCharacterSuggestions['@'];
        range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: position.column - 1, endColumn: position.column };
      } else if (textBeforeCursor.endsWith('self.')) {
        suggestions = selfCompletions;
      } else {
        suggestions = pythonSuggestions.filter(s => (s.label || '').toLowerCase().startsWith(currentWord));
      }

      const finalSuggestions = suggestions.map(s => ({ ...s, range }));
      return { suggestions: finalSuggestions };
    },
  };
}
