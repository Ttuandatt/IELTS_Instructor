import { useEffect, useRef, useCallback, useState } from 'react';

export function useAutoSave<T>(key: string, data: T, intervalMs = 5000) {
  const [restored, setRestored] = useState<T | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const hasRestored = useRef(false);

  // Restore on mount
  useEffect(() => {
    if (hasRestored.current) return;
    hasRestored.current = true;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setRestored(JSON.parse(saved));
      }
    } catch {
      // ignore parse errors
    }
  }, [key]);

  // Save on interval
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        localStorage.setItem(key, JSON.stringify(dataRef.current));
      } catch {
        // ignore quota errors
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }, [key, intervalMs]);

  const clear = useCallback(() => {
    localStorage.removeItem(key);
    setRestored(null);
  }, [key]);

  return { restored, clear };
}
