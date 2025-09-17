import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './ConfigurationModal.css';

export default function ConfigurationModal({ 
  open, 
  onClose, 
  title, 
  onTitleChange, // New prop for handling title changes
  children,
  width = "50%" 
}) {
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
        // If editing title, cancel edit instead of closing modal
        if (isEditingTitle) {
          setIsEditingTitle(false);
          setTempTitle(title); // Reset to original title
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
    setTempTitle(title); // Reset to original
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  if (!open) return null;

  // Use createPortal to render modal at document.body level
  return createPortal(
    <div className="node-setup-modal-backdrop" onClick={onClose}>
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
                <h2 className="node-setup-modal-title">{title}</h2>
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
          {children}
        </div>
      </div>
    </div>,
    document.body // Render at body level, not inside node
  );
}