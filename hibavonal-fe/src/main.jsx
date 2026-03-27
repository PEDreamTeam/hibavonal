import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';
import App from './App.jsx';
import theme from './theme/theme.js';
import { SWRConfig } from 'swr';
import { swrOptions } from './lib/swr-config.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SWRConfig value={swrOptions}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </SWRConfig>
  </StrictMode>
);
