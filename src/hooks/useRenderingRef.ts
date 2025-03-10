import { useState } from "react";

export function useRenderingRef<T>(
  initalValue: T | null
): [React.RefObject<T | null>, (newValue: T | null) => void] {
  const [state, setState] = useState<T | null>(initalValue);

  return [{ current: state }, setState];
}
