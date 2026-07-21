import { useState, useEffect } from "react";

/**
 * useDebounce — retrasa la actualización de un valor hasta que
 * dejan de ocurrir cambios durante `delay` milisegundos.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
