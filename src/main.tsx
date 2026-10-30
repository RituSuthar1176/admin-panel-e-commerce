import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeUIProvider } from 'theme-ui';
import theme from './theme';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeUIProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeUIProvider>
  </React.StrictMode>
);
