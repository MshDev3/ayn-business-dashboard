/**
 * Safe wrappers around Web Storage. Storage can be unavailable or throw
 * (private windows, blocked site data), so every access is guarded.
 */

function getStore(kind: 'local' | 'session'): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readJson<T>(key: string, fallback: T, kind: 'local' | 'session' = 'local'): T {
  const store = getStore(kind);
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown, kind: 'local' | 'session' = 'local'): void {
  const store = getStore(kind);
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: the in-memory state still works */
  }
}

export function readString(key: string, kind: 'local' | 'session' = 'local'): string | null {
  const store = getStore(kind);
  if (!store) return null;
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string, kind: 'local' | 'session' = 'local'): void {
  const store = getStore(kind);
  if (!store) return;
  try {
    store.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function removeKey(key: string, kind: 'local' | 'session' = 'local'): void {
  const store = getStore(kind);
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    /* ignore */
  }
}
