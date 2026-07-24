/**
 * cache.ts — Caché en memoria TTL para el backend del Club Campestre POS.
 *
 * Uso:
 *   import { getCache, setCache, invalidateCache } from '../cache';
 *
 *   const cached = getCache<MiTipo>('productos:1');
 *   if (cached) return res.json(cached);
 *   const data = await prisma...;
 *   setCache('productos:1', data, 120); // TTL 120 segundos
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<any>>();

/**
 * Obtiene un valor del caché. Retorna null si no existe o expiró.
 */
export function getCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

/**
 * Almacena un valor en el caché con un TTL en segundos (default 120s).
 */
export function setCache<T>(key: string, value: T, ttlSeconds = 120): void {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Elimina entradas del caché por prefijo o clave exacta.
 * Ejemplo: invalidateCache('productos') borra 'productos:1', 'productos:2', etc.
 */
export function invalidateCache(prefix: string): void {
  for (const key of store.keys()) {
    if (key === prefix || key.startsWith(prefix + ':') || key.startsWith(prefix + '_')) {
      store.delete(key);
    }
  }
}

/**
 * Limpia todo el caché.
 */
export function clearCache(): void {
  store.clear();
}

// Limpieza automática cada 5 minutos para evitar acumulación de entradas expiradas
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.expiresAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);
