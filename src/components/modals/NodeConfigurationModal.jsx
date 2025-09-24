// src/components/modals/NodeConfigurationModal.jsx
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import './ConfigurationModal.css';

const NodeConfigurationModal = ({ 
  open,
  title,
  subtitle,
  onClose,
  onSave,
  onTitleChange,
  children,
  errors = {},
  isValid = true,
  width = "50%" 
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  // Update tempTitle when title prop changes
  useEffect(() => {
    setTempTitle(title);
  }, [title]);

  // Close on ESC key
  useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (isEditingTitle) {
          setIsEditingTitle(false);
          setTempTitle(title);
        } else {
          onClose();
        }
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose, isEditingTitle, title]);

  // Prevent background scrolling when modal is open
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

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (onTitleChange && tempTitle.trim()) {
      onTitleChange(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(title);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  const handleBackdropClick = (e) => {
    // Only close if clicking the backdrop itself, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  return createPortal(
    <div 
      className="node-setup-modal-backdrop" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="node-setup-modal-content" 
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="node-setup-modal-header">
          <div className="node-setup-modal-title-container">
            {isEditingTitle ? (
              <div className="node-setup-modal-title-edit">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  onBlur={handleTitleSave}
                  autoFocus
                  className="node-setup-modal-title-input"
                />
                <div className="node-setup-modal-title-buttons">
                  <button
                    onClick={handleTitleSave}
                    className="node-setup-modal-title-save"
                    title="Save"
                  >
                    ✓
                  </button>
                  <button
                    onClick={handleTitleCancel}
                    className="node-setup-modal-title-cancel"
                    title="Cancel"
                  >
                    ×
                  </button>
                </div>
              </div>
            ) : (
              <div className="node-setup-modal-title-display">
                <h2 id="modal-title" className="node-setup-modal-title">{title}</h2>
                {onTitleChange && (
                  <button
                    onClick={handleTitleEdit}
                    className="node-setup-modal-title-edit-btn"
                    title="Edit title"
                  >
                    ✏️
                  </button>
                )}
              </div>
            )}
          </div>
          
          <button 
            className="node-setup-modal-close" 
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="node-setup-modal-body">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {subtitle && (
              <Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {subtitle}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Configure the basic settings for this node.
                </Typography>
              </Box>
            )}

            {children}

            {/* Validation summary */}
            {Object.keys(errors).length > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                <Typography variant="body2" color="error.dark">
                  Please fill in all required fields before saving.
                </Typography>
              </Box>
            )}

            {/* Save and Cancel buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={onSave}
                disabled={!isValid}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NodeConfigurationModal;