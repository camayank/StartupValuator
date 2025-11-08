/**
 * Object utility functions for compatibility across different TS targets
 */

export function objectEntries<T extends Record<string, any>>(
  obj: T
): Array<[string, T[keyof T]]> {
  return Object.entries(obj) as Array<[string, T[keyof T]]>;
}

export function objectValues<T extends Record<string, any>>(
  obj: T
): Array<T[keyof T]> {
  return Object.values(obj);
}

export function objectKeys<T extends Record<string, any>>(
  obj: T
): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

export function objectFromEntries<K extends string, V>(
  entries: Array<[K, V]>
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>;
}

export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result: any = {};
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result: any = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export function mapObject<T extends Record<string, any>, U>(
  obj: T,
  fn: (value: T[keyof T], key: string) => U
): Record<string, U> {
  const result: Record<string, U> = {};
  for (const [key, value] of objectEntries(obj)) {
    result[key] = fn(value, key);
  }
  return result;
}
