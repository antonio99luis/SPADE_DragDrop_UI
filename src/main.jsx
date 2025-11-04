import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import FlowEditor from './pages/FlowEditor.jsx'
import Home from './pages/Home.jsx'
import { ThemeProvider } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'
import { getTheme } from './theme'

function AppRoot() {
  const [mode, setMode] = useState(() => localStorage.getItem('ui.mode') || 'light');

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'ui.mode' && e.newValue) {
        setMode(e.newValue);
      }
    };
    const onCustom = (e) => {
      if (e.detail && e.detail.mode) {
        setMode(e.detail.mode);
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('ui-mode-changed', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('ui-mode-changed', onCustom);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-ui-mode', mode);
  }, [mode]);

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor" element={<FlowEditor />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
)
