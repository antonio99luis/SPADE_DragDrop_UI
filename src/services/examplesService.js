// Simula llamadas a backend para listar y cargar ejemplos de flujos
// Usa Vite import.meta.glob para descubrir archivos JSON bajo /examples

// Lazy import para carga bajo demanda
const modulesLazy = import.meta.glob('/examples/*.json', { eager: false });
// Eager import para leer metadatos (name, description) y preparar preview (nodes/edges)
const modulesMeta = import.meta.glob('/examples/*.json', { eager: true });

function fileNameFromPath(path) {
  const parts = path.split('/');
  const file = parts[parts.length - 1];
  return file.replace(/\.json$/i, '');
}

// Retorna una lista de ejemplos disponibles como si fuera una llamada HTTP
export async function listExamples() {
  // Simula latencia de red
  await new Promise((r) => setTimeout(r, 300));

  return Object.keys(modulesLazy).map((path) => {
    const id = fileNameFromPath(path);
    const mod = modulesMeta[path];
    // Vite expone el JSON bajo default
    const data = mod && (mod.default ?? mod);
    const name = (data && data.name) || id;
    const description = (data && data.description) || '';
    const nodes = (data && Array.isArray(data.nodes)) ? data.nodes : [];
    const edges = (data && Array.isArray(data.edges)) ? data.edges : [];
    return {
      id,
      name,
      description,
      path,
      load: modulesLazy[path],
      preview: { nodes, edges }
    };
  });
}

// Carga el JSON del ejemplo (lazy import) por id
export async function fetchExampleById(exampleId) {
  const entry = Object.entries(modulesLazy).find(([p]) => fileNameFromPath(p) === exampleId);
  if (!entry) throw new Error(`Ejemplo no encontrado: ${exampleId}`);
  const mod = await entry[1]();
  // Dependiendo de Vite, los JSON pueden estar envueltos como default
  return mod.default ?? mod;
}
