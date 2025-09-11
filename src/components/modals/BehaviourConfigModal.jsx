import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import './BehaviourConfigModal.css';

export default function BehaviourConfigModal({ open, code, onChange, onSave, onCancel, position, onReset }) {
  if (!open) return null;
  const left = position?.x ? position.x + 180 : 200;
  const top = position?.y ? position.y - 20 : 100;

  return (
    <div
      className="behaviour-modal-content"
      style={{ left, top }}
    >
      <h3>Behaviour Configuration (Python)</h3>
      <MonacoEditor
        height="300px"
        defaultLanguage="python"
        value={code}
        onChange={onChange}
        options={{ minimap: { enabled: false } }}
      />
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="behaviour-modal-reset-btn"
          onClick={() => {
            if (window.confirm('Reset to default code? This will delete your changes.')) {
              onReset();
            }
          }}
        >
          Reset
        </button>
        <div>
          <button onClick={onCancel} style={{ marginRight: 8 }}>Cancel</button>
          <button onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}