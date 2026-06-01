import * as React from "react";

import { cn } from "@/lib/utils";

export type TextShimmerProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "color"
> & {
  as?: React.ElementType;
  /**
   * Duration in seconds.
   * @default 1
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
   * Invert shimmer contrast in light theme only.
   * @default false
   */
  invertLight?: boolean;
  /**
   * Invert shimmer contrast in dark theme only.
   * @default false
   */
  invertDark?: boolean;
  /**
   * Delay before the next shimmer pass in seconds.
   * @default 0
   */
  repeatDelay?: number;
  /**
   * Disable shimmer animation and render plain text.
   * @default false
   */
  disableShimmer?: boolean;
};

export function TextShimmer({
  as: Comp = "span",
  className,
  style,
  duration = 1,
  repeatDelay = 0,
  spread = 20,
  angle = 0,
  color,
  invert = false,
  invertLight = false,
  invertDark = false,
  disableShimmer = false,
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
  const brightBeam =
    color ??
    "oklch(from currentColor max(0.8, calc(l + 0.4)) c h / calc(alpha + 0.35))";
  const dimBeam =
    color ??
    "oklch(from currentColor min(calc(l - 0.4), 0.2) c h / calc(alpha + 0.4))";
  const lightBeam = invert || invertLight ? dimBeam : brightBeam;
  const darkBeam = invert || invertDark ? dimBeam : brightBeam;
  const keyframes = `@keyframes ${keyframeName} {
    0% { background-position: 100% 50%; }
    ${movePercent}% { background-position: -60% 50%; }
    100% { background-position: -100% 50%; }
  }
  [data-nx-text-shimmer="${keyframeName}"] {
    --nx-text-shimmer-beam: var(--nx-text-shimmer-beam-light);
  }
  .dark [data-nx-text-shimmer="${keyframeName}"],
  [data-theme="dark"] [data-nx-text-shimmer="${keyframeName}"] {
    --nx-text-shimmer-beam: var(--nx-text-shimmer-beam-dark);
  }`;
  const shimmerVariables = disableShimmer
    ? {}
    : ({
        "--nx-text-shimmer-beam-light": lightBeam,
        "--nx-text-shimmer-beam-dark": darkBeam,
      } as React.CSSProperties);
  const shimmerStyle: React.CSSProperties = disableShimmer
    ? {}
    : {
        backgroundImage: `linear-gradient(${90 + angle}deg, ${edge} ${start}%, var(--nx-text-shimmer-beam) 50%, ${edge} ${end}%)`,
        animation: `${keyframeName} ${totalDuration}s linear infinite`,
        WebkitTextFillColor: "transparent",
      };

  return (
    <>
      {!disableShimmer ? <style>{keyframes}</style> : null}
      <Comp
        data-nx-text-shimmer={keyframeName}
        className={cn(
          !disableShimmer && "bg-size-[200%_auto] bg-clip-text",
          className,
        )}
        style={{
          ...shimmerVariables,
          ...shimmerStyle,
          ...style,
        } as React.CSSProperties}
        {...props}
      >
        {children}
      </Comp>
    </>
  );
}
