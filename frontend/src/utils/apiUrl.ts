export const getApiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  const envUrl = (import.meta as any).env?.VITE_API_URL;
  let baseUrl = '';

  if (envUrl && envUrl.trim() !== '') {
    baseUrl = envUrl.trim().replace(/\/$/, '');
  } else if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    baseUrl = 'https://campestre.alwaysdata.net';
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return baseUrl ? `${baseUrl}${cleanEndpoint}` : cleanEndpoint;
};
