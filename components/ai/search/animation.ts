"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/** Matches reasoning-demo message fade timing. */
export const askAiMessageEase = [0.25, 0.1, 0.25, 1] as const;

/** Row + assistant answer fade (reasoning-demo main column / row). */
export const askAiMessageFade = {
  duration: 0.3,
  ease: askAiMessageEase,
} as const;

/** Actions enter after the answer (reasoning-demo feedback bar timing). */
export const askAiActionsFade = {
  duration: 0.25,
  ease: askAiMessageEase,
  delay: 0.12,
} as const;

export const askAiAssistantRowDelay = 0.14;

export const askAiPanelSlide = {
  duration: 0.3,
  ease: askAiMessageEase,
} as const;

/** Prompt input enters after suggestion stagger. */
export const askAiInputFade = {
  ease: askAiMessageEase,
  duration: 0.3,
  delay: 0.38,
} as const;

export const askAiStaggerStep = 0.06;
export const askAiStaggerDelay = 0.08;

export const askAiStaggerListVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: askAiStaggerStep,
      delayChildren: askAiStaggerDelay,
    },
  },
} as const;

export const askAiStaggerItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: askAiMessageFade,
  },
} as const;

/** Re-run empty-state enter animations when the panel opens (forceMount) or chat clears. */
export function useAskAiEmptyEnter(open: boolean, isEmpty: boolean) {
  const [enterKey, setEnterKey] = useState(0);
  const prev = useRef({ open, isEmpty });

  useLayoutEffect(() => {
    const opened = open && !prev.current.open;
    const emptied = isEmpty && !prev.current.isEmpty;
    if (open && isEmpty && (opened || (emptied && prev.current.open))) {
      setEnterKey((key) => key + 1);
    }
    prev.current = { open, isEmpty };
  }, [open, isEmpty]);

  return { active: open && isEmpty, enterKey };
}

const animatedKeys = new Set<string>();

export function clearAnimateOnce(key: string) {
  animatedKeys.delete(key);
}

/** Fade-in only the first time this key mounts (survives panel close/open). */
export function useAnimateOnce(key: string) {
  const reduceMotion = useReducedMotion();
  const [shouldAnimate] = useState(
    () => !reduceMotion && !animatedKeys.has(key),
  );

  const onAnimationComplete = useCallback(() => {
    if (shouldAnimate) animatedKeys.add(key);
  }, [key, shouldAnimate]);

  return {
    initial: shouldAnimate ? ({ opacity: 0 } as const) : (false as const),
    onAnimationComplete,
  };
}
