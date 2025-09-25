// Helper to autocorrect class names to CamelCase
export function toCamelCase(str) {
  return str
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
// Helper to convert JS values to Python literals
export function toPythonValue(valor) {
  try {
    // Si es un string que parece JSON (ej. "{...}" o "[...]")
    if (typeof valor === "string" && (valor.startsWith("{") || valor.startsWith("["))) {
      return JSON.stringify(JSON.parse(valor))
        .replace(/true/g, "True")
        .replace(/false/g, "False")
        .replace(/null/g, "None");
    }

    // Si es número
    if (typeof valor === "number") {
      return valor;
    }

    // Si es booleano
    if (typeof valor === "boolean") {
      return valor ? "True" : "False";
    }

    // Si es array u objeto JS real
    if (Array.isArray(valor) || typeof valor === "object") {
      return JSON.stringify(valor)
        .replace(/true/g, "True")
        .replace(/false/g, "False")
        .replace(/null/g, "None");
    }

    // Si es string normal
    return `'${valor}'`;
  } catch (e) {
    // Fallback: tratamos como string
    return `'${valor}'`;
  }
}