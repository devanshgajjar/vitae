import { useEffect, useRef, useCallback } from 'react';

interface AutosaveOptions {
  key: string;
  delay?: number;
  enabled?: boolean;
}

/**
 * Hook for debounced autosave functionality
 */
export function useAutosave<T>(
  data: T,
  onSave: (data: T) => void | Promise<void>,
  options: AutosaveOptions
) {
  const { key, delay = 2000, enabled = true } = options;
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<T>(data);
  const isInitialRender = useRef(true);

  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        await onSave(data);
        // Also save to localStorage as backup
        localStorage.setItem(`autosave_${key}`, JSON.stringify(data));
      } catch (error) {
        console.error('Autosave failed:', error);
      }
    }, delay);
  }, [data, onSave, delay, key]);

  useEffect(() => {
    // Skip autosave on initial render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // Only autosave if data has actually changed and autosave is enabled
    if (enabled && JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
      debouncedSave();
      previousDataRef.current = data;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, debouncedSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Function to manually trigger save
  const manualSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    try {
      await onSave(data);
      localStorage.setItem(`autosave_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Manual save failed:', error);
      throw error;
    }
  }, [data, onSave, key]);

  // Function to restore from localStorage
  const restoreFromAutosave = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to restore from autosave:', error);
      return null;
    }
  }, [key]);

  // Function to clear autosave
  const clearAutosave = useCallback(() => {
    localStorage.removeItem(`autosave_${key}`);
  }, [key]);

  return {
    manualSave,
    restoreFromAutosave,
    clearAutosave
  };
}
