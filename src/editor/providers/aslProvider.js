// src/editor/providers/aslProvider.js
// Refactored to use the generic autocomplete factory.
import buildCompletionFactory from '../autocomplete/factory';

export function buildAslCompletionProvider(monaco, configOrContext = {}) {
  const cfg = configOrContext && (configOrContext.context || configOrContext.groups)
    ? configOrContext
    : { context: configOrContext, groups: [] };

  const defaultGroups = [
    'asl.planSnippets',
    'asl.goals',
    'asl.beliefs',
    'asl.functions',
  ];

  const groups = Array.isArray(cfg.groups) && cfg.groups.length ? cfg.groups : defaultGroups;

  return buildCompletionFactory(monaco, {
    language: 'asl',
    groups,
    context: { asl: cfg.context || cfg, ...cfg.context },
  });
}

export default buildAslCompletionProvider;
