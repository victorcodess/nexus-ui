"use client";

import { useCallback, useRef } from "react";
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

const animatedKeys = new Set<string>();

export function clearAnimateOnce(key: string) {
  animatedKeys.delete(key);
}

/** Fade-in only the first time this key mounts (survives panel close/open). */
export function useAnimateOnce(key: string) {
  const reduceMotion = useReducedMotion();
  const shouldAnimateRef = useRef(
    !reduceMotion && !animatedKeys.has(key),
  );

  const markDone = useCallback(() => {
    animatedKeys.add(key);
    shouldAnimateRef.current = false;
  }, [key]);

  const onAnimationComplete = useCallback(() => {
    if (shouldAnimateRef.current) markDone();
  }, [markDone]);

  return {
    initial: shouldAnimateRef.current
      ? ({ opacity: 0 } as const)
      : (false as const),
    onAnimationComplete,
  };
}
