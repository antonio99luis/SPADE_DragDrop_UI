import React from 'react';
import './PeriodicBehaviourFields.css';

export default function PeriodicBehaviourFields({ data, id, onChange }) {
  return (
    <>
      <div>
        Period:{' '}
        <input
          className="periodic-behaviour-input"
          type="number"
          value={data.period || ''}
          onChange={e => onChange(id, 'period', e.target.value)}
        />
      </div>
      <div>
        Start at:{' '}
        <input
          className="periodic-behaviour-input"
          type="number"
          value={data.start_at || ''}
          onChange={e => onChange(id, 'start_at', e.target.value)}
        />
      </div>
    </>
  );
}