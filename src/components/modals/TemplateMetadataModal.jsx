import React, { useState } from 'react';

export default function TemplateMetadataModal({ open, code, onChange, onSave, onCancel }) {
  const [tempCode, setTempCode] = useState(code || '{}');

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Edit Metadata (Python dict)</h3>
        <textarea
          value={tempCode}
          onChange={e => setTempCode(e.target.value)}
          rows={8}
          style={{ width: '100%' }}
        />
        <div style={{ marginTop: 10 }}>
          <button onClick={() => onSave(tempCode)}>Save</button>
          <button onClick={onCancel} style={{ marginLeft: 8 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}