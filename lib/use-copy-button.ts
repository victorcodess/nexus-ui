"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEventHandler,
} from "react";

const COPIED_RESET_MS = 1500;

/** After a successful `onCopy`, exposes a short “copied” state for UI feedback. */
export function useCopyButton(
  onCopy: () => void | Promise<void>,
): [checked: boolean, onClick: MouseEventHandler] {
  const [checked, setChecked] = useState(false);
  const callbackRef = useRef(onCopy);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = onCopy;
  }, [onCopy]);

  const onClick = useCallback<MouseEventHandler>(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    void Promise.resolve(callbackRef.current()).then(() => {
      setChecked(true);
      timeoutRef.current = setTimeout(() => {
        setChecked(false);
      }, COPIED_RESET_MS);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return [checked, onClick];
}
