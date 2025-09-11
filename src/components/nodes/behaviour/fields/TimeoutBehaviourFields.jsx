import React from 'react';
import './TimeoutBehaviourFields.css';

export default function TimeoutBehaviourFields({ data, id, onChange }) {
  return (
    <div>
      Start at:{' '}
      <input
        className="timeout-behaviour-input"
        type="number"
        value={data.start_at || ''}
        onChange={e => onChange(id, 'start_at', e.target.value)}
      />
    </div>
  );
}