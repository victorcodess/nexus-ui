import * as CoreIcons from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Cards({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "not-prose my-6 grid gap-4 sm:grid-cols-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

function resolveHugeIcon(name: string): IconSvgElement | null {
  const icon = (CoreIcons as unknown as Record<string, IconSvgElement | undefined>)[
    name
  ];
  return icon ?? null;
}

const cardShell =
  "group flex w-full rounded-xl bg-gray-100 p-4 dark:bg-gray-800 gap-6";

export function Card({
  title,
  icon,
  href,
  horizontal = false,
  className,
  children,
}: {
  title: string;
  /** Export name from `@hugeicons/core-free-icons`, e.g. `SparklesIcon`, `Copy01Icon`. */
  icon: string;
  href?: string;
  horizontal?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const iconData = resolveHugeIcon(icon);

  const body = (
    <>
      {iconData ? (
        <span
          className="inline-flex shrink-0 text-gray-900 dark:text-gray-50"
          aria-hidden
        >
          <HugeiconsIcon
            icon={iconData}
            className="size-6"
            strokeWidth={1.5}
          />
        </span>
      ) : null}
      <div
        className={cn(
          "min-w-0 flex-1 flex flex-col gap-2",
        )}
      >
        <p className="text-[15px] font-[450] leading-[15px] tracking-[-0.4px] text-gray-900 dark:text-gray-50">
          {title}
        </p>
        <div
          className={cn(
            "text-[13px] font-[350] leading-5.5 text-gray-500 dark:text-gray-400",
            "[&_code]:rounded-md [&_code]:bg-white [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-gray-900 dark:[&_code]:bg-gray-700 dark:[&_code]:text-gray-100",
            "[&_p]:m-0",
          )}
        >
          {children}
        </div>
      </div>
    </>
  );

  const innerClassName = cn(
    cardShell,
    horizontal ? "items-start gap-4" : "flex-col",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cn(innerClassName, "no-underline shadow-none")}>
        {body}
      </Link>
    );
  }

  return <div className={innerClassName}>{body}</div>;
}
