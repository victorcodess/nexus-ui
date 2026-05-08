"use client";
import type { ComponentProps } from "react";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { cn } from "../../lib/cn";
import { type ButtonProps, buttonVariants } from "../ui/button";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

interface SearchToggleProps
  extends Omit<ComponentProps<"button">, "variant">, ButtonProps {
  hideIfDisabled?: boolean;
}

export function SearchToggle({
  hideIfDisabled,
  size = "icon-sm",
  variant = "ghost",
  ...props
}: SearchToggleProps) {
  const { setOpenSearch, enabled } = useSearchContext();
  if (hideIfDisabled && !enabled) return null;

  return (
    <button
      type="button"
      className={cn(
        buttonVariants({
          size,
          variant,
        }),
        props.className,
      )}
      data-search=""
      aria-label="Open Search"
      onClick={() => {
        setOpenSearch(true);
      }}
    >
      <HugeiconsIcon icon={Search01Icon} className="size-4.5" strokeWidth={2} />
    </button>
  );
}

export function LargeSearchToggle({
  hideIfDisabled,
  ...props
}: ComponentProps<"button"> & {
  hideIfDisabled?: boolean;
}) {
  const { enabled, hotKey, setOpenSearch } = useSearchContext();
  const { text } = useI18n();
  if (hideIfDisabled && !enabled) return null;

  return (
    <button
      type="button"
      data-search-full=""
      {...props}
      className={cn(
        "inline-flex w-[240px] cursor-pointer items-center gap-2 rounded-full border border-gray-800 bg-gray-950 p-1.5 ps-2 pe-2 text-sm text-gray-500 transition-colors hover:bg-gray-900 hover:text-gray-400",
        props.className,
      )}
      onClick={() => {
        setOpenSearch(true);
      }}
    >
      <HugeiconsIcon icon={Search01Icon} className="size-4" strokeWidth={2} />
      {text.search}
      <KbdGroup className="ms-auto inline-flex gap-1">
        {hotKey.map((k, i) => (
          <Kbd
            key={i}
            className="size-5 items-center justify-center rounded-sm bg-gray-800 text-sm text-gray-400"
          >
            {k.display}
          </Kbd>
        ))}
      </KbdGroup>
    </button>
  );
}
