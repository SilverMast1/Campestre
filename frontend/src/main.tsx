import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Aplicar tema guardado al cargar la app
const temaGuardado = localStorage.getItem('campestre_tema');
if (temaGuardado === 'claro') {
  document.documentElement.classList.add('tema-claro');
}
import { useStore } from './store';

// Interceptor global de fetch para manejar la expiración o invalidez de tokens y anteponer la URL base del backend
const getApiUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) return envUrl;
  return '';
};

const API_URL = getApiUrl();
const { fetch: originalFetch } = window;

const fetchWithRetry = async (targetUrl: string | URL | Request, reqConfig: RequestInit | undefined, retries = 3, delay = 1000): Promise<Response> => {
  try {
    const res = await originalFetch(targetUrl, reqConfig);
    // Si el túnel o servidor retornan 502/503/504 (túnel parpadeando o reconectando), reintentar automáticamente
    if ([502, 503, 504].includes(res.status) && retries > 0) {
      console.warn(`[Túnel/Red] Estado ${res.status}. Reintentando automáticamente en ${delay}ms... (${retries} reintentos restantes)`);
      await new Promise(r => setTimeout(r, delay));
      return fetchWithRetry(targetUrl, reqConfig, retries - 1, delay * 1.5);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      console.warn(`[Túnel/Red] Micro-corte de red (${err}). Reintentando automáticamente en ${delay}ms... (${retries} reintentos restantes)`);
      await new Promise(r => setTimeout(r, delay));
      return fetchWithRetry(targetUrl, reqConfig, retries - 1, delay * 1.5);
    }
    throw err;
  }
};

window.fetch = async (...args) => {
  let [url, config] = args;
  if (typeof url === 'string' && url.startsWith('/api')) {
    url = API_URL ? API_URL + url : url;
  }
  
  // Agregar encabezados para bypass de pantallas de advertencia de túneles (GitHub/localtunnel)
  config = config || {};
  const headers = new Headers(config.headers || {});
  if (!headers.has('bypass-tunnel-reminder')) {
    headers.set('bypass-tunnel-reminder', 'true');
  }
  if (!headers.has('X-Tunnel-Skip-AntiPhishing-Page')) {
    headers.set('X-Tunnel-Skip-AntiPhishing-Page', 'true');
  }
  config.headers = headers;

  const response = await fetchWithRetry(url, config);
  if (response.status === 401) {
    const requestUrl = typeof args[0] === 'string' ? args[0] : 'url' in args[0] ? (args[0] as any).url : args[0].toString();
    // Evitar desloguear si es la petición inicial de login
    if (requestUrl && !requestUrl.includes('/api/auth/login')) {
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

