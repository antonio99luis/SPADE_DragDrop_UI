// src/components/modals/CodeConfigurationModal.jsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import './ConfigurationModal.css';

const CodeConfigurationModal = ({ 
  open,
  code,
  onChange,
  onSave,
  onCancel,
  onReset,
  title = "Configure Behaviour Code"
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

  if (!open) return null;

  return createPortal(
    <div className="node-setup-modal-backdrop" onClick={onCancel}>
      <div 
        className="node-setup-modal-content" 
        style={{ width: "70%", maxWidth: "800px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="node-setup-modal-header">
          <h2 className="node-setup-modal-title">{title}</h2>
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
              Write your behaviour code here. The class name will be updated automatically.
            </Typography>
            
            <textarea
              value={code}
              onChange={(e) => onChange(e.target.value)}
              style={{
                flex: 1,
                fontFamily: 'Monaco, Consolas, monospace',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '12px',
                resize: 'none',
                outline: 'none'
              }}
              placeholder="Enter your Python code here..."
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
                <Button variant="contained" onClick={onSave}>
                  Save Code
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

export default CodeConfigurationModal;