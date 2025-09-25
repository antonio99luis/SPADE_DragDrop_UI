import { createTheme } from '@mui/material/styles';

// Read the CSS variable value
const getPrimaryColor = () => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--primary-color')
      .trim() || '#ff9800'; // fallback
  }
  return '#ff9800'; // fallback for SSR
};

// Read the CSS variable value
const getSecondaryColor = () => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--secondary-color')
      .trim() || '#f50057'; // fallback
  }
  return '#f50057'; // fallback for SSR
};

const theme = createTheme({
  palette: {
    primary: {
      main: getPrimaryColor(),
    },
    secondary: {
      main: getSecondaryColor(),
    },
  },
});

export default theme;