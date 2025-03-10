import { useState, useEffect } from "react";

export const useLocalStorage = <T>(
  key: string,
  initialValue?: T,
  afterParse?: (json: any) => T
) => {
  const [storedValue, setStoredValue] = useState<T | undefined>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item)
        return afterParse ? afterParse(JSON.parse(item)) : JSON.parse(item);
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (storedValue === undefined) {
        localStorage.clear();
        return;
      }
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error storing localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
};
