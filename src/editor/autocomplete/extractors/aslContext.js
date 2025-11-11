// src/editor/autocomplete/extractors/aslContext.js
// Utilidades para construir completionContext del editor ASL.
// Extrae nombres de acciones Python decoradas con @actions.add(...) o @actions.add_function(...)
// y beliefs simples del código AgentSpeak(L).
//
// Ejemplo de uso:
//   import { buildAslCompletionContext } from './extractors/aslContext';
//   const ctx = buildAslCompletionContext({ bdiFunctionCode, aslCode, extraBeliefs });
//   <CodeConfigurationModal completionContext={ctx} autocompleteGroups={[ 'asl.planSnippets','asl.goals','asl.beliefs','asl.functions' ]} />
//
// Nota: Este parser es heurístico (regex). Para casos avanzados se podría implementar un parser formal.

/**
 * Extrae nombres de acciones Python de código fuente con decoradores @actions.add("py.name", arity)
 * o @actions.add_function("py.name", arity)
 * Devuelve solo la parte completa (e.g. 'py.tune').
 */
export function extractPythonActionNames(pySource = '') {
  const actions = new Set();
  const regex = /@actions\.(?:add|add_function)\(\s*['"]([A-Za-z\_\-\.]*)['"]\s*(?:,\s*[\(A-Za-z0-9\),]+)?\s*\)/g;
  let m;
  while ((m = regex.exec(pySource)) !== null) {
    actions.add(m[1]);
  }
  return Array.from(actions);
}

/**
 * Extrae beliefs simples de código ASL.
 * Estrategia:
 *  - Ignora comentarios // y bloques /* *\/.
 *  - Toma líneas que terminan en '.' y que NO empiezan por +, -, ?, @, '.', '<', ':'
 *  - Devuelve la línea completa sin el punto final.
 */
// initialBeliefs: beliefs iniciales definidos en el agente (array de strings)
export function extractBeliefs(aslSource = '', initialBeliefs = []) {
  // Elimina comentarios de bloque para simplificar (no perfecto, pero suficiente)
  const beliefs = new Set();
  // Añadir beliefs iniciales del agente si se proporcionan
  if (Array.isArray(initialBeliefs)) {
    for (const b of initialBeliefs) {
      if (typeof b === 'string' && b.trim()) beliefs.add(b.trim());
    }
  }
  return Array.from(beliefs);
}

/**
 * Construye el completionContext esperado por el provider ASL.
 * @param {Object} params
 * @param {string} params.bdiFunctionCode - Código Python donde se definen acciones (@actions.add)
 * @param {string} params.aslCode - Código ASL del agente (beliefs + planes)
 * @param {string[]} [params.extraBeliefs] - Lista adicional manual de beliefs
 * @param {string[]} [params.goals] - Lista de metas conocidas (strings sin +! )
 * @returns {Object} completionContext { beliefs, functions, goals }
 */
export function buildAslCompletionContext({ bdiFunctionCode = '', aslCode = '', extraBeliefs = [], goals = [] } = {}) {
  const functions = extractPythonActionNames(bdiFunctionCode);
  const beliefsFromCode = extractBeliefs(aslCode, extraBeliefs);
  const allBeliefs = Array.from(new Set(beliefsFromCode));
  return {
    beliefs: allBeliefs,
    functions,
    goals,
  };
}

export default {
  extractPythonActionNames,
  extractBeliefs,
  buildAslCompletionContext,
};
