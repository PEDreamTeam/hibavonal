import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SWRConfig } from 'swr';
import './index.css';
import App from './App.jsx';
import theme from './theme/theme.js';
import { fetcher } from './api/fetcher';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SWRConfig value={{ fetcher }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SWRConfig>
    </ThemeProvider>
  </StrictMode>
);
