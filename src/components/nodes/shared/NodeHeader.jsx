import './NodeHeader.css';
import React from 'react';

export default function NodeHeader({ image, title, subtitle, actionsRight }) {
  return (
    <div className={'node-header'} style={{ position: 'relative' }}>
      <div className="node-header-header">
        <img src={image} alt="" className="node-header-img" />
        <div className="node-header-titles">
          <span className="node-header-title">{title}</span>
          {subtitle ? <span className="node-header-subtitle">{subtitle}</span> : null}
        </div>
        {actionsRight ? <div className="node-header-actions">{actionsRight}</div> : null}
      </div>
    </div>
  );
}