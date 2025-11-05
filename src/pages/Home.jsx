import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Grid from '@mui/material/Grid';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import GitHubIcon from '@mui/icons-material/GitHub';
// (removed menu button)
// ThemeProvider se gestiona en main.jsx para toda la app
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import TranslateIcon from '@mui/icons-material/Translate';
import { listExamples } from '../services/examplesService';
import { useI18n } from '../i18n/I18nProvider';
// Preview eliminada por petición: mostramos solo nombre/descr.
 
const REPO_URL = import.meta.env.VITE_REPO_URL || 'https://github.com/your-org/SPADE_DragDrop_UI'; // Configurable por env

export default function Home() {
  const navigate = useNavigate();
  const { t, lang, setLanguage } = useI18n();
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const CARD_HEIGHT = 220;
  const CARD_WIDTH = 280; // ancho de tarjeta (reservado para futuros ajustes de layout)
  const [mode, setMode] = useState(() => localStorage.getItem('ui.mode') || 'light');
  const [optionsAnchor, setOptionsAnchor] = useState(null);
  const optionsOpen = Boolean(optionsAnchor);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await listExamples();
        if (mounted) setExamples(list);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleOpenExample = (ex) => {
    navigate(`/editor?example=${encodeURIComponent(ex.id)}`);
  };

  const handleCreateNew = () => {
    navigate('/editor');
  };

  const handleOpenOptions = (e) => setOptionsAnchor(e.currentTarget);
  const handleCloseOptions = () => setOptionsAnchor(null);
  const handleSetMode = (m) => {
    setMode(m);
    localStorage.setItem('ui.mode', m);
    handleCloseOptions();
  };
  const handleSetLanguage = (l) => { setLanguage(l); handleCloseOptions(); };

  return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Top AppBar */}
        <AppBar position="static" color="primary" elevation={1}>
          <Toolbar>
            <Typography variant="h4" component="div" sx={{ ml: 0 }}>
              SPADE & drop
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            {/* Options button */}
            <Tooltip title={t('home.optionsTooltip')}>
              <IconButton color="inherit" onClick={handleOpenOptions} aria-label="options">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <Menu anchorEl={optionsAnchor} open={optionsOpen} onClose={handleCloseOptions} keepMounted>
              <MenuItem disabled>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DarkModeIcon fontSize="small" />
                  <Typography variant="subtitle2">{t('options.theme')}</Typography>
                </Box>
              </MenuItem>
              <MenuItem selected={mode === 'light'} onClick={() => { handleSetMode('light'); window.dispatchEvent(new CustomEvent('ui-mode-changed', { detail: { mode: 'light' } })); }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LightModeIcon fontSize="small" /> {t('options.light')}
                </Box>
              </MenuItem>
              <MenuItem selected={mode === 'dark'} onClick={() => { handleSetMode('dark'); window.dispatchEvent(new CustomEvent('ui-mode-changed', { detail: { mode: 'dark' } })); }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DarkModeIcon fontSize="small" /> {t('options.dark')}
                </Box>
              </MenuItem>
              <Divider sx={{ my: 1 }} />
              <MenuItem disabled>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TranslateIcon fontSize="small" />
                  <Typography variant="subtitle2">{t('options.language')}</Typography>
                </Box>
              </MenuItem>
              <MenuItem selected={lang === 'es'} onClick={() => handleSetLanguage('es')}>Español (ES)</MenuItem>
              <MenuItem selected={lang === 'en'} onClick={() => handleSetLanguage('en')}>English (EN)</MenuItem>
            </Menu>

            <Tooltip title={t('home.repoTooltip')}>
              <IconButton color="inherit" component="a" href={REPO_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <GitHubIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Content */}
        <Box sx={{ p: 3, flex: 1, maxWidth: 1400, width: '100%', mx: 'auto' }}>
          <Typography variant="h5" sx={{ mb: 2, color: 'text.primary' }}>{t('home.examplesGalleryTitle')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('home.examplesGalleryHelp')}
          </Typography>

          <Grid container spacing={2} columns={{ xs: 2, sm: 8, md: 12 }}>
            {/* Plus (nuevo flujo) */}
            <Grid xs={2} sm={4} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card variant="outlined" sx={{ height: CARD_HEIGHT, width: CARD_WIDTH, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CardActionArea onClick={handleCreateNew} sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    <AddCircleOutlineIcon sx={{ fontSize: 48 }} />
                    <Typography variant="subtitle1" sx={{ mt: 1 }}>{t('home.newFlow')}</Typography>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>

            {/* Ejemplos */}
            {loading ? (
              <Grid xs={2} sm={4} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card variant="outlined" sx={{ height: CARD_HEIGHT, width: CARD_WIDTH, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">{t('home.loadingExamples')}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : examples.length === 0 ? (
              <Grid xs={2} sm={8} md={9} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card variant="outlined" sx={{ height: CARD_HEIGHT, width: CARD_WIDTH, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">{t('home.noExamples')}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              examples.map((ex) => (
                <Grid key={ex.id} xs={2} sm={4} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Card variant="outlined" sx={{ height: CARD_HEIGHT, width: CARD_WIDTH, display: 'flex' }}>
                    <CardActionArea onClick={() => handleOpenExample(ex)} sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'stretch' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>{ex.name}</Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {ex.description || ex.path}
                      </Typography>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      </Box>
  );
}
