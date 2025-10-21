// src/editor/customLanguage.js
// Register a custom language in Monaco with Monarch tokens provider and optional language configuration.
// Usage: registerCustomLanguage(monaco, { id: 'mydsl', monarch: {...}, conf: {...}, aliases: ['MyDSL'] })

export function registerCustomLanguage(monaco, { id, monarch, conf, aliases = [] }) {
  if (!id) return;
  try {
    monaco.languages.register({ id, aliases: [id, ...aliases] });
    if (monarch) monaco.languages.setMonarchTokensProvider(id, monarch);
    if (conf) monaco.languages.setLanguageConfiguration(id, conf);
  } catch (e) {
    // Fail-safe: avoid crashing if registration is repeated
    // In dev hot reload, Monaco may already have a language with the same id.
    // eslint-disable-next-line no-console
    console.warn(`[customLanguage] Could not register language '${id}':`, e);
  }
}
