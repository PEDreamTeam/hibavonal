import { StrictMode, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SWRConfig } from 'swr';
import './index.css';
import App from './App.jsx';
import useSettingsStore from './store/useSettingsStore';
import { fetcher } from './api/fetcher';

const fontSizeMap = { small: 13, medium: 16, large: 20 };

const baseTheme = {
  palette: {
    primary: { main: '#d32f2f' },
    secondary: { main: '#1565c0' },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
};

function ThemedApp() {
  const { mode, fontSize, loaded, loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        ...baseTheme,
        palette: { ...baseTheme.palette, mode },
        typography: {
          ...baseTheme.typography,
          fontSize: fontSizeMap[fontSize] ?? 16,
        },
      }),
    [mode, fontSize]
  );

  if (!loaded) return null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SWRConfig value={{ fetcher }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SWRConfig>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemedApp />
  </StrictMode>
);
