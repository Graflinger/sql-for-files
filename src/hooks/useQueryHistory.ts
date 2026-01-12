import { useState, useEffect, useCallback } from 'react';
import { get, set } from 'idb-keyval';

export interface QueryHistoryEntry {
  id: string;
  query: string;
  timestamp: number;
  status: 'success' | 'error';
  rowCount?: number;
  executionTime?: number;
  error?: string;
}

const HISTORY_KEY = 'query-history';
const MAX_HISTORY_ENTRIES = 50;

/**
 * Hook for managing query history with IndexedDB persistence
 *
 * Features:
 * - Stores up to 50 most recent queries
 * - Persists across browser sessions
 * - Tracks execution status, row counts, timing
 * - Provides CRUD operations
 */
export function useQueryHistory() {
  const [history, setHistory] = useState<QueryHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      const stored = await get<QueryHistoryEntry[]>(HISTORY_KEY);
      if (stored && Array.isArray(stored)) {
        setHistory(stored);
      }
    } catch (error) {
      console.error('Failed to load query history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load history from IndexedDB on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const saveHistory = async (newHistory: QueryHistoryEntry[]) => {
    try {
      // Update state immediately for instant UI feedback
      setHistory(newHistory);
      // Then persist to IndexedDB
      await set(HISTORY_KEY, newHistory);
    } catch (error) {
      console.error('Failed to save query history:', error);
    }
  };

  /**
   * Add a new query to history
   * Automatically prunes to MAX_HISTORY_ENTRIES
   */
  const addQuery = async (entry: Omit<QueryHistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: QueryHistoryEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    // Add to front, keep only last MAX_HISTORY_ENTRIES
    const newHistory = [newEntry, ...history].slice(0, MAX_HISTORY_ENTRIES);
    await saveHistory(newHistory);
  };

  /**
   * Delete a specific query from history
   */
  const deleteQuery = async (id: string) => {
    const newHistory = history.filter(entry => entry.id !== id);
    await saveHistory(newHistory);
  };

  /**
   * Clear all query history
   */
  const clearHistory = async () => {
    await saveHistory([]);
  };

  /**
   * Get relative time string (e.g., "2 minutes ago")
   */
  const getRelativeTime = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    const days = Math.floor(seconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  };

  return {
    history,
    loading,
    addQuery,
    deleteQuery,
    clearHistory,
    getRelativeTime,
    loadHistory,
  };
}
