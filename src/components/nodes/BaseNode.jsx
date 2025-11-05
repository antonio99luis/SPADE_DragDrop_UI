// src/components/nodes/BaseNode.jsx
import React from 'react';
import NodeHeader from './shared/NodeHeader';
import NodeDivider from './shared/NodeDivider';
import { LabeledHandle } from './shared/LabeledHandle';
import Typography from '@mui/material/Typography';
import { useI18n } from '../../i18n/I18nProvider';


  const BaseNode = ({ 
  selected, 
  onDoubleClick, 
  icon, 
  title, 
  subtitle,
  actionsRight,
  attributes = [], 
  handles = [], 
  children, 
  className = "base-node" 
}) => {
  const { t } = useI18n();

  return (
    <div
      className={`${className}${selected ? ` ${className}-selected` : ''}`}
      onDoubleClick={onDoubleClick}
      style={{ cursor: 'pointer' }}
    >
  <NodeHeader image={icon} title={title} subtitle={subtitle} actionsRight={actionsRight} />

      <NodeDivider title={t('nodeProperties.attributes')} />

      <div className={`${className}-attributes`}>
        {attributes.map(({ label, value }, index) => (
          <Typography key={index} variant="body2" color="text.secondary">
            <strong>{label}:</strong> {value}
          </Typography>
        ))}
      </div>

      {children}

      {handles.length > 0 && (
        <>
          {handles.some(h => h.type === 'target') && (
            <>
              <NodeDivider title={t('nodeProperties.inputs')} />
              {handles.filter(h => h.type === 'target').map(handle => (
                <LabeledHandle
                  key={handle.id}
                  {...handle}
                  title={handle.titleKey ? t(handle.titleKey, handle.title) : handle.title}
                />
              ))}
            </>
          )}
          
          {handles.some(h => h.type === 'source') && (
            <>
              <NodeDivider title={t('nodeProperties.outputs')} />
              {handles.filter(h => h.type === 'source').map(handle => (
                <LabeledHandle
                  key={handle.id}
                  {...handle}
                  title={handle.titleKey ? t(handle.titleKey, handle.title) : handle.title}
                />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default BaseNode;