// src/components/forms/FormField.jsx
import React from 'react';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';


export const TextFormField = ({ 
  label, 
  value, 
  onChange, 
  onBlur, 
  error, 
  helperText, 
  required = false,
  type = "text",
  placeholder = "",
  ...props 
}) => (
  <TextField
    label={label}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onBlur={onBlur}
    placeholder={placeholder}
    variant="outlined"
    fullWidth
    required={required}
    error={error}
    helperText={helperText}
    type={type}
    {...props}
  />
);

export const NumberFormField = ({ 
  label, 
  value, 
  onChange, 
  onBlur, 
  error, 
  helperText, 
  placeholder = "",
  ...props 
}) => (
  <TextField
    label={label}
    value={value}
    onChange={(e) => {
      const val = e.target.value;
      if (/^\d*$/.test(val)) {
        onChange(val);
      }
    }}
    onBlur={onBlur}
    placeholder={placeholder}
    variant="outlined"
    fullWidth
    type="number"
    error={error}
    helperText={helperText}
    {...props}
  />
);

export const SwitchFormField = ({ 
  label, 
  checked, 
  onChange, 
  ...props 
}) => (
  <FormControlLabel
    control={
      <Switch
        checked={checked || false}
        onChange={(e) => onChange(e.target.checked)}
        inputProps={{ 'aria-label': 'controlled' }}
        {...props}
      />
    }
    label={label}
  />
);

export const SelectFormField = ({ 
  label, 
  value, 
  onChange, 
  onBlur, 
  error, 
  helperText, 
  options = [],
  required = false,
  ...props 
}) => (
  <FormControl fullWidth required={required} error={error} variant="outlined">
    <InputLabel>{label}</InputLabel>
    <Select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      label={label}
      MenuProps={{
        // Prevent the menu from being rendered in a portal
        disablePortal: true,
        // Ensure menu appears above other elements
        PaperProps: {
          style: {
            zIndex: 9999,
          },
        },
      }}
      {...props}
    >
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
    {helperText && <FormHelperText>{helperText}</FormHelperText>}
  </FormControl>
);

export const TextAreaFormField = ({ 
  label, 
  value, 
  onChange, 
  onBlur, 
  error, 
  helperText, 
  required = false,
  rows = 3,
  placeholder = "",
  ...props 
}) => (
  <TextField
    label={label}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onBlur={onBlur}
    placeholder={placeholder}
    variant="outlined"
    fullWidth
    required={required}
    error={error}
    helperText={helperText}
    multiline
    rows={rows}
    {...props}
  />
);