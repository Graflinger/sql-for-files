import { vi } from "vitest";

/**
 * In-memory store that mimics IndexedDB via idb-keyval.
 */
const store = new Map<IDBValidKey, unknown>();

export const mockIdbKeyval = {
  get: vi.fn((key: IDBValidKey) => Promise.resolve(store.get(key))),
  set: vi.fn((key: IDBValidKey, value: unknown) => {
    store.set(key, value);
    return Promise.resolve();
  }),
  del: vi.fn((key: IDBValidKey) => {
    store.delete(key);
    return Promise.resolve();
  }),
  keys: vi.fn(() => Promise.resolve(Array.from(store.keys()))),
  clear: vi.fn(() => {
    store.clear();
    return Promise.resolve();
  }),
};

/**
 * Reset the in-memory store between tests.
 */
export function resetIdbStore() {
  store.clear();
  mockIdbKeyval.get.mockClear();
  mockIdbKeyval.set.mockClear();
  mockIdbKeyval.del.mockClear();
  mockIdbKeyval.keys.mockClear();
  mockIdbKeyval.clear.mockClear();
}
