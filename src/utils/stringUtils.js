// Helper to autocorrect class names to CamelCase
export function toCamelCase(str) {
  return str
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}