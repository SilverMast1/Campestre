import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') return envUrl.trim().replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://campestre.alwaysdata.net';
  }
  return '';
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 25000, // 25s para tolerar latencia del túnel
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
    'X-Tunnel-Skip-AntiPhishing-Page': 'true',
  },
});

// Interceptor para inyectar token JWT e Idempotency Key
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campestre_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Agregar Idempotency-Key para métodos de modificación (POST, PUT, DELETE) si no se especifica una
    if (['post', 'put', 'delete'].includes(config.method || '') && !config.headers['Idempotency-Key']) {
      // Generar una llave idempotente única basada en timestamp o UUID
      const randHex = Math.random().toString(16).substring(2, 10);
      config.headers['Idempotency-Key'] = `idem-${Date.now()}-${randHex}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores comunes (ej: desloguear si el token expira) y reintentar si la red/túnel falla
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    if (config && !config._isRetry) {
      config._retryCount = config._retryCount || 0;
      const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error');
      const isTunnelError = error.response && [502, 503, 504].includes(error.response.status);

      if ((isNetworkError || isTunnelError) && config._retryCount < 3) {
        config._retryCount += 1;
        const delay = config._retryCount * 1000;
        console.warn(`[Axios Reintento] Reintentando petición (${config._retryCount}/3) a ${config.url} en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiClient(config);
      }
    }

    if (error.response && error.response.status === 401) {
      console.warn('Sesión expirada o no autorizada. Redirigiendo a Login...');
      localStorage.removeItem('campestre_token');
      localStorage.removeItem('campestre_user_type');
      localStorage.removeItem('campestre_user');
      localStorage.removeItem('campestre_socio');
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
