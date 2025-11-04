// src/domain/agents/normalizers.js

// Convert legacy beliefs array ["k", "k:v"] to object map { k: v? }
export const beliefsArrayToObject = (arr) => {
  const obj = {};
  (Array.isArray(arr) ? arr : []).forEach((item) => {
    if (typeof item !== 'string') return;
    const idx = item.indexOf(':');
    if (idx > -1) {
      const k = item.slice(0, idx).trim();
      const v = item.slice(idx + 1).trim();
      if (k) obj[k] = v;
    } else {
      const k = item.trim();
      if (k) obj[k] = '';
    }
  });
  return obj;
};

export const beliefsObjectToArray = (map) => {
  if (!map || typeof map !== 'object') return [];
  return Object.entries(map).map(([k, v]) => {
    const hasVal = v !== undefined && v !== null && String(v).trim() !== '';
    return hasVal ? `${k}:${v}` : k;
  });
};

export const functionsTextToArray = (text) => {
  const t = typeof text === 'string' ? text : '';
  return t.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
};
