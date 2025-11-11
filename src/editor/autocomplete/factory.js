// src/editor/autocomplete/factory.js
// Generic factory to build Monaco completion providers based on enabled groups and context.
// Exports: buildCompletionFactory(monaco, { language, groups, context }) => provider
// Groups are semantic buckets that can be mixed & matched across agent / behaviour / ASL scopes.
// Supported group keys (extensible):
// - common.pythonKeywords
// - behavior.selfMethods
// - behavior.controlChars ($, @)
// - agent.visibility
// - agent.behaviours
// - knowledge.keys
// - asl.beliefs
// - asl.functions
// - asl.goals
// - asl.planSnippets
// Each group returns raw suggestion objects; factory merges and filters by prefix when needed.

export function buildCompletionFactory(monaco, { language, groups = [], context = {} }) {
  const ctx = context || {};
  const agent = ctx.agent || {};
  const behaviour = ctx.behavior || ctx.behaviour || {}; // allow both spellings
  const aslCtx = ctx.asl || ctx.agent || {}; // beliefs/functions may sit on agent

  // Utility to wrap range later
  const wrap = (arr, range) => arr.map(s => ({ ...s, range }));

  // --- GROUP DEFINITIONS ---
  const groupBuilders = {
    'common.pythonKeywords': () => [
      { label: 'await', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'await ${1:expr}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
      { label: 'async def', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'async def ${1:name}(${2:self}):\n    ${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
      { label: 'def', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'def ${1:name}(${2:self}):\n    ${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
      { label: 'for', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'for ${1:item} in ${2:iterable}:\n    ${3:pass}' },
      { label: 'while', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'while ${1:cond}:\n    ${2:pass}' },
      { label: 'if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'if ${1:cond}:\n    ${2:pass}' },
      { label: 'try', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'try:\n    ${1:pass}\nexcept ${2:Exception} as ${3:e}:\n    ${4:pass}' },
      { label: 'print', kind: monaco.languages.CompletionItemKind.Function, insertText: 'print(${1:"Hello"})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
      { label: 'return', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'return ${1:value}' },
    ],

    'behavior.selfMethods': () => {
      const knowledgeKeys = dedupe([...(agent.variables || []), ...(behaviour.knowledgeKeys || [])]);
      const visibleAgents = normalizeAgents(agent.visibleAgents);
      const connectedBehaviors = dedupe(behaviour.connectedBehaviors || []);
      return [
        { label: 'send', kind: monaco.languages.CompletionItemKind.Method, insertText: 'send(${1:message})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
        { label: 'receive', kind: monaco.languages.CompletionItemKind.Method, insertText: 'receive(${1:timeout})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
        { label: 'set', kind: monaco.languages.CompletionItemKind.Method, insertText: 'set("${1:key}", ${2:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
        { label: 'get', kind: monaco.languages.CompletionItemKind.Method, insertText: 'get("${1:key}")', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
        { label: 'agent', kind: monaco.languages.CompletionItemKind.Property, insertText: 'agent' },
        { label: 'presence', kind: monaco.languages.CompletionItemKind.Property, insertText: 'presence' },
        { label: 'kill', kind: monaco.languages.CompletionItemKind.Method, insertText: 'kill(${1:exit_code})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
        ...knowledgeKeys.flatMap(k => ([
          { label: `get("${k}")`, kind: monaco.languages.CompletionItemKind.Method, insertText: `get("${k}")` },
          { label: `set("${k}", ...)`, kind: monaco.languages.CompletionItemKind.Method, insertText: 'set("' + k + '", ${1:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
        ])),
        ...visibleAgents.flatMap(v => ([
          { label: `presence.subscribe("${v.label}")`, kind: monaco.languages.CompletionItemKind.Method, insertText: `presence.subscribe("${v.jid}")` },
          { label: `presence.unsubscribe("${v.label}")`, kind: monaco.languages.CompletionItemKind.Method, insertText: `presence.unsubscribe("${v.jid}")` },
        ])),
        ...connectedBehaviors.map(b => ({ label: `agent.add_behaviour(${b})`, kind: monaco.languages.CompletionItemKind.Method, insertText: `agent.add_behaviour(${b})` })),
      ];
    },

    'behavior.controlChars': () => {
      const knowledgeKeys = dedupe([...(agent.variables || []), ...(behaviour.knowledgeKeys || [])]);
      const visibleAgents = normalizeAgents(agent.visibleAgents);
      const connectedBehaviors = dedupe(behaviour.connectedBehaviors || []);
      return {
        '$': [
          { label: '$agent', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'self.agent', detail: 'Parent agent' },
          { label: '$presence', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'self.presence', detail: 'Presence manager' },
          { label: '$is_running', kind: monaco.languages.CompletionItemKind.Property, insertText: 'self.is_running()', detail: 'Is behaviour running' },
          { label: '$exit_code', kind: monaco.languages.CompletionItemKind.Property, insertText: 'self.exit_code', detail: 'Exit code' },
          ...visibleAgents.map(v => ({ label: `$contact:${v.label}`, kind: monaco.languages.CompletionItemKind.Reference, insertText: v.jid, detail: 'Visible agent JID' })),
          ...knowledgeKeys.map(k => ({ label: `$knowledge:${k}`, kind: monaco.languages.CompletionItemKind.Text, insertText: k, detail: 'Knowledge key' })),
        ],
        '@': [
          { label: '@send', kind: monaco.languages.CompletionItemKind.Method, insertText: 'await self.send(${1:message})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
          { label: '@receive', kind: monaco.languages.CompletionItemKind.Method, insertText: 'msg = await self.receive(${1:timeout})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
          { label: '@set', kind: monaco.languages.CompletionItemKind.Method, insertText: 'self.set("${1:key}", ${2:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
          { label: '@get', kind: monaco.languages.CompletionItemKind.Method, insertText: 'self.get("${1:key}")', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
          { label: '@kill', kind: monaco.languages.CompletionItemKind.Method, insertText: 'self.kill(${1:exit_code})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
          { label: '@match', kind: monaco.languages.CompletionItemKind.Method, insertText: 'if msg and msg.match(${1:template}):\n    ${2:# Handle message}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
          { label: '@add_behaviour', kind: monaco.languages.CompletionItemKind.Method, insertText: 'self.agent.add_behaviour(${1:behaviour})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
          ...knowledgeKeys.map(k => ({ label: `@get:${k}`, kind: monaco.languages.CompletionItemKind.Method, insertText: `self.get("${k}")` })),
          ...knowledgeKeys.map(k => ({ label: `@set:${k}`, kind: monaco.languages.CompletionItemKind.Method, insertText: 'self.set("' + k + '", ${1:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet })),
          ...normalizeAgents(agent.visibleAgents).map(v => ({ label: `@subscribe:${v.label}`, kind: monaco.languages.CompletionItemKind.Method, insertText: `await self.presence.subscribe("${v.jid}")` })),
          ...normalizeAgents(agent.visibleAgents).map(v => ({ label: `@unsubscribe:${v.label}`, kind: monaco.languages.CompletionItemKind.Method, insertText: `await self.presence.unsubscribe("${v.jid}")` })),
          ...connectedBehaviors.map(b => ({ label: `@add_behaviour:${b}`, kind: monaco.languages.CompletionItemKind.Method, insertText: `self.agent.add_behaviour(${b})` })),
        ]
      };
    },

    'agent.visibility': () => normalizeAgents(agent.visibleAgents).map(v => ({
      label: `contact:${v.label}`,
      kind: monaco.languages.CompletionItemKind.Reference,
      insertText: v.jid,
      detail: 'Visible agent JID',
    })),

    'agent.behaviours': () => dedupe(agent.behaviours || behaviour.connectedBehaviors || []).map(b => ({
      label: `behaviour:${b}`,
      kind: monaco.languages.CompletionItemKind.Class,
      insertText: b,
      detail: 'Behaviour name',
    })),

    'knowledge.keys': () => dedupe([...(agent.variables || []), ...(behaviour.knowledgeKeys || [])]).map(k => ({
      label: `knowledge:${k}`,
      kind: monaco.languages.CompletionItemKind.Field,
      insertText: k,
      detail: 'Knowledge key',
    })),

    'asl.beliefs': () => dedupe(aslCtx.beliefs || []).map(b => ({
      label: b,
      kind: monaco.languages.CompletionItemKind.Value,
      insertText: b,
      detail: 'Belief',
    })),

    'asl.functions': () => dedupe(aslCtx.functions || []).map(f => ({
      label: f + '()',
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: f + '(${1:args})',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: 'Agent function',
    })),

    'asl.goals': () => dedupe(aslCtx.goals || []).map(g => ({
      label: '+!' + g,
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '+!' + g,
      detail: 'Goal trigger',
    })),

    'asl.planSnippets': () => [{
      label: 'plan skeleton',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '+!${1:goal} : ${2:context} <- ${3:actions};',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: 'ASL plan template'
    }],
  };

  // --- HELPER FUNCTIONS ---
  function dedupe(arr) { return Array.from(new Set(arr || [])).filter(Boolean); }
  function normalizeAgents(list) {
    return (list || []).map(a => typeof a === 'string' ? { label: a, jid: a } : { label: a.name || a.jid, jid: a.jid });
  }

  // Build all suggestions for active groups
  const builtGroups = groups
    .filter(g => groupBuilders[g])
    .map(g => [g, groupBuilders[g]()]);

  // Special handling for control chars group for python behaviour
  const controlCharMap = builtGroups.find(([name]) => name === 'behavior.controlChars');

  return {
    triggerCharacters: ['.', '$', '@', '+', '-', '?', '!', ':', '(', ',', ';'],
    provideCompletionItems(model, position) {
      const textBeforeCursor = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });
      const wordInfo = model.getWordUntilPosition(position);
      let range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: wordInfo.startColumn,
        endColumn: wordInfo.endColumn,
      };
      const prefix = (wordInfo.word || '').toLowerCase();

      // Control characters immediate suggestions
      if (controlCharMap) {
        const controlChars = controlCharMap[1];
        if (textBeforeCursor.endsWith('$')) {
          const list = controlChars['$'] || [];
          range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: position.column - 1, endColumn: position.column };
          return { suggestions: wrap(list, range) };
        }
        if (textBeforeCursor.endsWith('@')) {
          const list = controlChars['@'] || [];
          range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: position.column - 1, endColumn: position.column };
          return { suggestions: wrap(list, range) };
        }
      }

      // Special namespace: "py." in ASL editors to expose Python functions of the agent
      // If the user typed py. or py.<partial>, show only function suggestions and filter by <partial>
      // Works only if the 'asl.functions' group is enabled
      const pyMatch = /(^|[^A-Za-z0-9_])([A-Za-z0-9_\-\.]*)$/.exec(textBeforeCursor);
      if (pyMatch) {
        const partial = (pyMatch[2] || '').toLowerCase();
        const aslFunctionsGroup = builtGroups.find(([name]) => name === 'asl.functions');
        const list = (aslFunctionsGroup && Array.isArray(aslFunctionsGroup[1])) ? aslFunctionsGroup[1] : [];
        const filtered = partial
          ? list.filter(s => (s.label || '').toLowerCase().startsWith(partial))
          : list;
        // Keep range as is so we append after py.
        return { suggestions: wrap(filtered, range) };
      }

      // Gather flat suggestions from other groups
      const flat = builtGroups
        .filter(([name]) => name !== 'behavior.controlChars')
        .flatMap(([, arr]) => arr);

      // Filter by prefix when typing a word (skip filtering if prefix empty)
      const filtered = prefix
        ? flat.filter(s => (s.label || '').toLowerCase().startsWith(prefix))
        : flat;

      return { suggestions: wrap(filtered, range) };
    }
  };
}

export default buildCompletionFactory;
