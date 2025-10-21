// src/hooks/useAgentGeneralFields.jsx
import { useMemo } from 'react';

export function useAgentGeneralFields(modalData) {
  return useMemo(() => ({
    classField: {
      label: 'Class Name',
      value: modalData.getCurrentValue('class'),
      onChange: (v) => modalData.handleTempChange('class', v),
      onBlur: () => modalData.handleBlur('class'),
      placeholder: 'Python class name (e.g., MyAgent)',
      required: true,
      error: modalData.hasError('class'),
      helperText: modalData.getErrorMessage('class', 'The Python class name for this agent'),
    },
    nameField: {
      label: 'Agent Name',
      value: modalData.getCurrentValue('name'),
      onChange: (v) => modalData.handleTempChange('name', v),
      onBlur: () => modalData.handleBlur('name'),
      placeholder: 'Agent instance name (e.g., agent1)',
      required: true,
      error: modalData.hasError('name'),
      helperText: modalData.getErrorMessage('name', 'The unique name for this agent instance'),
    },
    hostField: {
      label: 'Host',
      value: modalData.getCurrentValue('host'),
      onChange: (v) => modalData.handleTempChange('host', v),
      onBlur: () => modalData.handleBlur('host'),
      placeholder: 'localhost',
      required: true,
      error: modalData.hasError('host'),
      helperText: modalData.getErrorMessage('host', 'The host where this agent will run'),
    },
    passwordField: {
      label: 'Password',
      value: modalData.getCurrentValue('password'),
      onChange: (v) => modalData.handleTempChange('password', v),
      onBlur: () => modalData.handleBlur('password'),
      placeholder: 'password',
      type: 'password',
      required: true,
      error: modalData.hasError('password'),
      helperText: modalData.getErrorMessage('password', 'The password for this agent'),
    },
    portField: {
      label: 'Port',
      value: modalData.getCurrentValue('port'),
      onChange: (v) => modalData.handleTempChange('port', v),
      placeholder: '5222',
      helperText: 'The port number where this agent will run',
    },
    verifySecurityField: {
      label: 'Verify Security',
      checked: modalData.getCurrentValue('verify_security'),
      onChange: (checked) => modalData.handleTempChange('verify_security', checked),
    },
  }), [modalData]);
}
