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

export function getTheme(mode = 'light') {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: getPrimaryColor(),
      },
      secondary: {
        main: getSecondaryColor(),
      },
    },
  });
}

// Default theme (light) for backward compatibility
const defaultTheme = getTheme('light');
export default defaultTheme;