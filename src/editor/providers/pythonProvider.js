// src/editor/providers/pythonProvider.js
// Exports a builder for Monaco completion provider suited for SPADE Python snippets
// Signature: buildPythonCompletionProvider(monaco, context?)
// context example:
// {
//   scope: 'behavior' | 'agent' | 'asl',
//   agent: {
//     variables?: string[],        // knowledge keys at agent level
//     visibleAgents?: Array<string | { name?: string, jid: string }>,
//   },
//   behavior: {
//     name?: string,
//     connectedBehaviors?: string[],
//     knowledgeKeys?: string[],
//   }
// }
import buildCompletionFactory from '../autocomplete/factory';

export function buildPythonCompletionProvider(monaco, configOrContext = {}) {
  // Backward compat: previously second arg was `context`. Now we accept { context, groups }
  const cfg = configOrContext && (configOrContext.context || configOrContext.groups)
    ? configOrContext
    : { context: configOrContext, groups: [] };

  // Default groups for python if none provided
  const defaultGroups = [
    'common.pythonKeywords',
    'behavior.selfMethods',
    'behavior.controlChars',
    'agent.visibility',
    'agent.behaviours',
    'knowledge.keys',
  ];

  const groups = Array.isArray(cfg.groups) && cfg.groups.length ? cfg.groups : defaultGroups;

  return buildCompletionFactory(monaco, {
    language: 'python',
    groups,
    context: cfg.context || {},
  });
}
