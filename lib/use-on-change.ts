"use client";

import * as React from "react";

/**
 * Runs `onChange` when `value` changes (compared against previous render).
 */
export function useOnChange<T>(
  value: T,
  onChange: (current: T, previous: T) => void,
  isUpdated: (previous: T, current: T) => boolean = Object.is,
) {
  const previousRef = React.useRef(value);

  React.useEffect(() => {
    const previous = previousRef.current;
    if (!isUpdated(previous, value)) {
      onChange(value, previous);
    }
    previousRef.current = value;
  }, [value, onChange, isUpdated]);
}
