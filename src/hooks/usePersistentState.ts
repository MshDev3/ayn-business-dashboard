import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { readJson, writeJson } from '../utils/storage';

/**
 * useState that mirrors its value to localStorage.
 * Stored values are merged over the defaults (for plain objects) so older saved shapes keep working.
 */
export function usePersistentState<T extends object>(
  key: string,
  defaults: T,
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = readJson<Partial<T> | null>(key, null);
    return stored && typeof stored === 'object' ? { ...defaults, ...stored } : defaults;
  });

  useEffect(() => {
    writeJson(key, value);
  }, [key, value]);

  const reset = useCallback(() => setValue(defaults), [defaults]);

  return [value, setValue, reset];
}
