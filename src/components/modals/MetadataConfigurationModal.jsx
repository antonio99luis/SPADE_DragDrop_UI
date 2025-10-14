// src/components/modals/MetadataConfigurationModal.jsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import './ConfigurationModal.css';

const MetadataConfigurationModal = ({ 
  open,
  code,
  onChange,
  onSave,
  onCancel,
  onReset,
  title = "Configure Message Metadata"
}) => {
  // Close on ESC key
  useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onCancel]);

  // Prevent background scrolling
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Validate JSON
  const isValidJSON = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  if (!open) return null;

  const isValid = isValidJSON(code);

  return createPortal(
    <div 
      className="node-setup-modal-backdrop" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="metadata-modal-title"
    >
      <div 
        className="node-setup-modal-content" 
        style={{ width: "60%", maxWidth: "700px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="node-setup-modal-header">
          <h2 id="metadata-modal-title" className="node-setup-modal-title">{title}</h2>
          <button 
            className="node-setup-modal-close" 
            onClick={onCancel}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="node-setup-modal-body">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '400px' }}>
            <Typography variant="body2" color="text.secondary">
              Configure the metadata for your message template. Must be valid JSON format.
            </Typography>
            
            {!isValid && (
              <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                <Typography variant="body2" color="error.dark">
                  ⚠️ Invalid JSON format. Please check your syntax.
                </Typography>
              </Box>
            )}
            
            <textarea
              value={code}
              onChange={(e) => onChange(e.target.value)}
              style={{
                flex: 1,
                fontFamily: 'Monaco, Consolas, monospace',
                fontSize: '14px',
                border: `1px solid ${isValid ? '#ccc' : '#f44336'}`,
                borderRadius: '4px',
                padding: '12px',
                resize: 'none',
                outline: 'none',
                backgroundColor: isValid ? '#fff' : '#fef7f7'
              }}
              placeholder='{"key": "value", "example": "metadata"}'
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                color="warning"
                onClick={onReset}
              >
                Reset to Default
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={onCancel}>
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  onClick={onSave}
                  disabled={!isValid}
                >
                  Save Metadata
                </Button>
              </Box>
            </Box>
          </Box>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MetadataConfigurationModal;