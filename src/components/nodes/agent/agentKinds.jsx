// src/config/agentKinds.jsx
import React from 'react';
import Chip from '@mui/material/Chip';
import ExclusiveSettingsBDI from './exclusive/ExclusiveSettingsBDI';
import ExclusiveSettingsLLM from './exclusive/ExclusiveSettingsLLM';

export const AGENT_KIND = {
  STANDARD: 'standard',
  BDI: 'bdi',
  LLM: 'llm',
};

export const AGENT_KIND_OPTIONS = [
  { value: AGENT_KIND.STANDARD, label: 'Standard' },
  { value: AGENT_KIND.BDI, label: 'BDI' },
  { value: AGENT_KIND.LLM, label: 'LLM (experimental)' },
];

// Helper to push attributes
const asChipCount = (count, singular = 'entry', plural = 'entries') => (
  <Chip label={`${count} ${count === 1 ? singular : plural}`} color={count > 0 ? 'success' : 'default'} size="small" />
);

export const agentKinds = {
  [AGENT_KIND.STANDARD]: {
    attributes: (data) => [],
    badge: null,
    ExclusiveSettings: () => null,
  },

  [AGENT_KIND.BDI]: {
    attributes: (data) => {
      const beliefsCount = data.beliefsObj
        ? Object.keys(data.beliefsObj || {}).length
        : (data.beliefs || []).length;
      return [
        { label: 'Kind', value: 'BDI' },
        { label: 'Beliefs', value: asChipCount(beliefsCount) },
      ];
    },
    badge: { label: 'BDI', color: 'primary' },
    ExclusiveSettings: ExclusiveSettingsBDI,
  },

  [AGENT_KIND.LLM]: {
    attributes: (data) => [
      { label: 'Kind', value: 'LLM' },
    ],
    badge: { label: 'LLM', color: 'secondary' },
    ExclusiveSettings: ExclusiveSettingsLLM,
  },
};
