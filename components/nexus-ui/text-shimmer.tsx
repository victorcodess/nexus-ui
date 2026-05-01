import * as React from "react";

import { cn } from "@/lib/utils";

export type TextShimmerProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "color"
> & {
  as?: React.ElementType;
  /**
   * Duration in seconds.
   * @default 4
   */
  duration?: number;
  /**
   * Spread around center in percent points.
   * @default 20
   */
  spread?: number;
  /**
   * Beam angle in degrees.
   * @default 0
   */
  angle?: number;
  /**
   * Override highlight color.
   */
  color?: string;
  /**
   * Invert shimmer contrast.
   * @default false
   */
  invert?: boolean;
  /**
   * Delay before the next shimmer pass in seconds.
   * @default 0
   */
  repeatDelay?: number;
};

export function TextShimmer({
  as: Comp = "span",
  className,
  style,
  duration = 4,
  repeatDelay = 0,
  spread = 20,
  angle = 0,
  color,
  invert = false,
  children,
  ...props
}: TextShimmerProps) {
  const id = React.useId();
  const boundedSpread = Math.min(Math.max(spread, 5), 45);
  const activeDuration = Math.max(duration, 0);
  const pauseDuration = Math.max(repeatDelay, 0);
  const totalDuration = Math.max(activeDuration + pauseDuration, 0.001);
  const movePercent = (activeDuration / totalDuration) * 100;
  const keyframeName = React.useMemo(
    () => `nx-text-shimmer-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [id],
  );
  const start = 50 - boundedSpread;
  const end = 50 + boundedSpread;
  const edge = "currentColor";
  const beam = invert
    ? (color ??
      "oklch(from currentColor min(calc(l - 0.4), 0.2) c h / calc(alpha + 0.4))")
    : (color ??
      "oklch(from currentColor max(0.8, calc(l + 0.4)) c h / calc(alpha + 0.35))");
  const keyframes = `@keyframes ${keyframeName} {
    0% { background-position: 200% 50%; }
    ${movePercent}% { background-position: -200% 50%; }
    100% { background-position: -200% 50%; }
  }`;

  return (
    <>
      <style>{keyframes}</style>
      <Comp
        className={cn("bg-size-[200%_auto] bg-clip-text", className)}
        style={{
          backgroundImage: `linear-gradient(${90 + angle}deg, ${edge} ${start}%, ${beam} 50%, ${edge} ${end}%)`,
          animation: `${keyframeName} ${totalDuration}s linear infinite`,
          WebkitTextFillColor: "transparent",
          ...style,
        }}
        {...props}
      >
        {children}
      </Comp>
    </>
  );
}
