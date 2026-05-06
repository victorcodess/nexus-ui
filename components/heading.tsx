import { Link02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { cn } from "../lib/cn";

type Types = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type HeadingProps<T extends Types> = Omit<ComponentPropsWithoutRef<T>, "as"> & {
  as?: T;
};

export function Heading<T extends Types = "h1">({
  as,
  className,
  ...props
}: HeadingProps<T>): ReactElement {
  const As = as ?? "h1";

  if (!props.id) return <As className={className} {...props} />;

  return (
    <As
      className={cn(
        "relative flex scroll-m-28 flex-row items-center gap-2",
        className,
      )}
      {...props}
    >
      <a data-card="" href={`#${props.id}`} className="peer">
        {props.children}
      </a>
      <HugeiconsIcon
        icon={Link02Icon}
        strokeWidth={2}
        aria-hidden
        className="size-4 shrink-0 text-ring opacity-0 transition-opacity peer-hover:opacity-100 md:absolute md:-left-1.5 md:-translate-x-full"
      />
    </As>
  );
}
