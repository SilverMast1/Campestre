import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { useStore } from './store';

// Interceptor global de fetch para manejar la expiración o invalidez de tokens y anteponer la URL base del backend
const API_URL = import.meta.env.VITE_API_URL || '';
const { fetch: originalFetch } = window;

window.fetch = async (...args) => {
  let [url, config] = args;
  if (typeof url === 'string' && url.startsWith('/api')) {
    url = API_URL + url;
  }
  const response = await originalFetch(url, config);
  if (response.status === 401 || response.status === 403) {
    const url = typeof args[0] === 'string' ? args[0] : 'url' in args[0] ? (args[0] as any).url : args[0].toString();
    // Evitar desloguear si es la petición inicial de login
    if (url && !url.includes('/api/auth/login')) {
      useStore.getState().logout();
      console.warn('Sesión expirada o token inválido. Redirigiendo al login.');
    }
  }
  return response;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

