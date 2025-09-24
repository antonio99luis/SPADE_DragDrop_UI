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
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';



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
export const PasswordFormField = ({
    label,
    value,
    onChange,
    onBlur,
    error,
    helperText,
    required = false,
    placeholder = "",
    ...props
}) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };
    return (
        <FormControl variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">{label}</InputLabel>
            <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                placeholder={placeholder}
                variant="outlined"
                fullWidth
                required={required}
                error={error}
                helperText={helperText}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            aria-label={
                                showPassword ? 'hide the password' : 'display the password'
                            }
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            onMouseUp={handleMouseUpPassword}
                            edge="end"
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                }
                label={label}
            />
        </FormControl>
    )
}
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
export const DateTimeFormField = ({
    label,
    value,
    onChange,
    onBlur,
    error,
    helperText,
    required = false,
    placeholder = "",
    ...props
}) => {
    // Convert string to Date object or null
    const dateValue = value ? new Date(value) : null;
    
    // Handle date change
    const handleDateChange = (newValue) => {
        if (newValue) {
            // Format to ISO string for storage
            onChange(newValue.toISOString());
        } else {
            onChange('');
        }
    };

    return (
         <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
                label={label}
                value={dateValue}
                onChange={handleDateChange}
                onClose={onBlur}
                slotProps={{
                    textField: {
                        fullWidth: true,
                        variant: "outlined",
                        required: required,
                        error: error,
                        helperText: helperText,
                        placeholder: placeholder,
                    },
                    popper: {
                        // Asegurar que el popper tenga un z-index alto
                        sx: {
                            zIndex: 9999
                        }
                    },
                    desktopPaper: {
                        // Para desktop, asegurar z-index alto
                        sx: {
                            zIndex: 9999
                        }
                    },
                    mobilePaper: {
                        // Para mobile, asegurar z-index alto
                        sx: {
                            zIndex: 9999
                        }
                    }
                }}
                format="yyyy-MM-dd HH:mm:ss"
                ampm={false} // Use 24-hour format
                {...props}
            />
        </LocalizationProvider>
    );
};

export const FloatFormField = ({
    label,
    value,
    onChange,
    onBlur,
    error,
    helperText,
    placeholder = "",
    min = 0,
    max,
    step = 0.1,
    ...props
}) => {
    const handleChange = (e) => {
        const val = e.target.value;
        
        // Allow empty string, decimal numbers, and numbers
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
            onChange(val);
        }
    };

    const handleBlur = (e) => {
        const val = e.target.value;
        
        // Convert to float and validate range
        if (val !== '') {
            const floatVal = parseFloat(val);
            if (!isNaN(floatVal)) {
                let finalVal = floatVal;
                
                // Apply min/max constraints
                if (min !== undefined && finalVal < min) finalVal = min;
                if (max !== undefined && finalVal > max) finalVal = max;
                
                // Update with constrained value
                onChange(finalVal.toString());
            }
        }
        
        if (onBlur) onBlur(e);
    };

    return (
        <TextField
            label={label}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            variant="outlined"
            fullWidth
            type="number"
            error={error}
            helperText={helperText}
            inputProps={{
                min: min,
                max: max,
                step: step,
            }}
            {...props}
        />
    );
};