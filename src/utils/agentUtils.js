// src/utils/agentUtils.js
import md5 from 'blueimp-md5';

export const buildAvatarUrl = (jid) => {
  const digest = md5((jid || '').trim().toLowerCase());
  return `http://www.gravatar.com/avatar/${digest}?d=monsterid`;
};

export const validateMetadataKey = (key) => {
  const k = (key || '').trim();
  if (!k) return 'Key cannot be empty';
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k)) {
    return 'Key must be a valid identifier (letters, numbers, underscore)';
  }
  return null;
};
