import { useState, useCallback, useRef } from "react";
import { debounce } from "@/utils";

interface UseDebounceOptions {
  delay?: number;
}

interface UseDebounceReturn<T> {
  value: T | undefined;
  debouncedValue: T | undefined;
  setValue: (value: T) => void;
}

export function useDebounce<T>(
  initialValue: T | undefined = undefined,
  options: UseDebounceOptions = {}
): UseDebounceReturn<T> {
  const { delay = 300 } = options;
  
  const [value, setValueState] = useState<T | undefined>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T | undefined>(initialValue);
  
  const debouncedFn = useRef(
    debounce((newValue: T) => {
      setDebouncedValue(newValue);
    }, delay)
  );
  
  const setValue = useCallback((newValue: T) => {
    setValueState(newValue);
    debouncedFn.current(newValue);
  }, []);
  
  return {
    value,
    debouncedValue,
    setValue,
  };
}
