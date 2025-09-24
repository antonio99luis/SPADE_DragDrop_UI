// src/components/forms/KeyValueTable.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const KeyValueTable = ({
  data = {},
  onChange,
  label = "Key-Value Pairs",
  keyLabel = "Key",
  valueLabel = "Value",
  keyPlaceholder = "Enter key",
  valuePlaceholder = "Enter value",
  addButtonText = "Add Entry",
  emptyMessage = "No entries added yet. Click 'Add Entry' to get started.",
  maxHeight = "300px",
  readOnly = false,
  validateKey = null, // Function to validate key
  validateValue = null, // Function to validate value
  ...props
}) => {
  // Convert object to array of key-value pairs
  const [entries, setEntries] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize entries only once or when data changes externally
  useEffect(() => {
    if (!isInitialized || Object.keys(data).length === 0) {
      const entriesArray = Object.entries(data).map(([key, value], index) => ({
        id: `entry_${Date.now()}_${index}`, // More stable ID
        key,
        value,
        isEditing: false
      }));
      setEntries(entriesArray);
      setIsInitialized(true);
    }
  }, [data, isInitialized]);

  // Debounced update parent function
  const updateParent = useCallback((newEntries) => {
    const newData = {};
    newEntries
      .filter(entry => entry.key.trim() !== '') // Only include entries with non-empty keys
      .forEach(entry => {
        newData[entry.key.trim()] = entry.value;
      });
    
    if (onChange) {
      onChange(newData);
    }
  }, [onChange]);

  // Add new entry
  const addEntry = () => {
    const newEntry = {
      id: `entry_${Date.now()}_new`, // Unique ID
      key: '',
      value: '',
      isEditing: true
    };
    const newEntries = [...entries, newEntry];
    setEntries(newEntries);
    // Don't update parent immediately for new empty entries
  };

  // Remove entry
  const removeEntry = (id) => {
    const newEntries = entries.filter(entry => entry.id !== id);
    setEntries(newEntries);
    updateParent(newEntries);
  };

  // Update entry - only update local state, debounce parent updates
  const updateEntry = useCallback((id, field, value) => {
    setEntries(prevEntries => {
      const newEntries = prevEntries.map(entry => 
        entry.id === id ? { ...entry, [field]: value } : entry
      );
      
      // Update parent immediately for demo purposes, but you could debounce this
      setTimeout(() => updateParent(newEntries), 0);
      
      return newEntries;
    });
  }, [updateParent]);

  // Handle key validation
  const getKeyError = (key, entryId) => {
    if (validateKey) {
      const error = validateKey(key);
      if (error) return error;
    }
    
    // Check for duplicate keys
    const duplicateCount = entries.filter(entry => 
      entry.key.trim() === key.trim() && entry.id !== entryId
    ).length;
    
    if (duplicateCount > 0) {
      return "Duplicate key not allowed";
    }
    
    return null;
  };

  // Handle value validation
  const getValueError = (value) => {
    if (validateValue) {
      return validateValue(value);
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%' }} {...props}>
      {/* Header with just the label */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h3">
          {label}
        </Typography>
      </Box>

      {entries.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4, 
          color: 'text.secondary',
          fontStyle: 'italic'
        }}>
          {emptyMessage}
        </Box>
      ) : (
        <TableContainer 
          component={Paper} 
          variant="outlined"
          sx={{ maxHeight, overflow: 'auto', mb: 2 }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>{keyLabel}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{valueLabel}</TableCell>
                {!readOnly && (
                  <TableCell sx={{ fontWeight: 'bold', width: '60px' }}>
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry) => {
                const keyError = getKeyError(entry.key, entry.id);
                const valueError = getValueError(entry.value);
                
                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <TextField
                        value={entry.key}
                        onChange={(e) => updateEntry(entry.id, 'key', e.target.value)}
                        placeholder={keyPlaceholder}
                        size="small"
                        fullWidth
                        error={!!keyError}
                        helperText={keyError}
                        disabled={readOnly}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={entry.value}
                        onChange={(e) => updateEntry(entry.id, 'value', e.target.value)}
                        placeholder={valuePlaceholder}
                        size="small"
                        fullWidth
                        error={!!valueError}
                        helperText={valueError}
                        disabled={readOnly}
                        variant="outlined"
                        multiline={entry.value.length > 50}
                        maxRows={3}
                      />
                    </TableCell>
                    {!readOnly && (
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => removeEntry(entry.id)}
                          size="small"
                          title="Remove entry"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add button centered below the table */}
      {!readOnly && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addEntry}
            size="small"
          >
            {addButtonText}
          </Button>
        </Box>
      )}

      {/* Entry count */}
      {entries.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </Typography>
      )}
    </Box>
  );
};

export default KeyValueTable;