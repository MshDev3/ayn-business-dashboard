import type { Lang } from '../types';
import { ar } from './ar';
import { en } from './en';
import type { Dictionary } from './en';

export const dictionaries: Record<Lang, Dictionary> = { ar, en };

type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

/** Every dot-separated path in the dictionary that resolves to a string, e.g. "employees.form.name". */
export type TranslationKey = Leaves<Dictionary>;

export function resolveKey(dictionary: Dictionary, key: TranslationKey): string {
  let node: unknown = dictionary;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return key;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : key;
}

export const LANGUAGE_META: Record<Lang, { label: string; short: string; dir: 'rtl' | 'ltr' }> = {
  ar: { label: 'العربية', short: 'ع', dir: 'rtl' },
  en: { label: 'English', short: 'EN', dir: 'ltr' },
};
