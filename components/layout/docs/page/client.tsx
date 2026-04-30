"use client";

import {
  type ComponentProps,
  createContext,
  Fragment,
  use,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "fumadocs-core/link";
import { cn } from "../../../../lib/cn";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { useTreeContext, useTreePath } from "fumadocs-ui/contexts/tree";
import type * as PageTree from "fumadocs-core/page-tree";
import { usePathname } from "fumadocs-core/framework";
import {
  type BreadcrumbOptions,
  getBreadcrumbItemsFromPath,
} from "fumadocs-core/breadcrumb";
import { isActive } from "../../../../lib/urls";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../fd/collapsible";
import { useTOCItems } from "../../../toc";
import { useActiveAnchor } from "fumadocs-core/toc";
import { LayoutContext } from "../client";
import { useFooterItems } from "fumadocs-ui/utils/use-footer-items";
import {
  Copy01Icon,
  Tick02Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const TocPopoverContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

export function PageTOCPopover({
  className,
  children,
  ...rest
}: ComponentProps<"div">) {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const { isNavTransparent } = use(LayoutContext)!;

  const onClick = useEffectEvent((e: Event) => {
    if (!open) return;

    if (ref.current && !ref.current.contains(e.target as HTMLElement))
      setOpen(false);
  });

  useEffect(() => {
    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <TocPopoverContext
      value={useMemo(
        () => ({
          open,
          setOpen,
        }),
        [setOpen, open],
      )}
    >
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        data-toc-popover=""
        className={cn(
          "sticky top-(--fd-docs-row-2) z-10 h-(--fd-toc-popover-height) [grid-area:toc-popover] xl:hidden max-xl:layout:[--fd-toc-popover-height:--spacing(10)]",
          className,
        )}
        {...rest}
      >
        <header
          ref={ref}
          className={cn(
            "border-b backdrop-blur-sm transition-colors",
            (!isNavTransparent || open) && "bg-fd-background/80",
            open && "shadow-lg",
          )}
        >
          {children}
        </header>
      </Collapsible>
    </TocPopoverContext>
  );
}

export function PageTOCPopoverTrigger({
  className,
  ...props
}: ComponentProps<"button">) {
  const { text } = useI18n();
  const { open } = use(TocPopoverContext)!;
  const items = useTOCItems();
  const active = useActiveAnchor();
  const selected = useMemo(
    () => items.findIndex((item) => active === item.url.slice(1)),
    [items, active],
  );
  const path = useTreePath().at(-1);
  const showItem = selected !== -1 && !open;

  return (
    <CollapsibleTrigger
      className={cn(
        "gap-2.0 py-2.0 flex h-10 w-full items-center px-4 text-start text-sm text-fd-muted-foreground focus-visible:outline-none md:px-6 [&_svg]:size-4",
        className,
      )}
      data-toc-popover-trigger=""
      {...props}
    >
      <ProgressCircle
        value={(selected + 1) / Math.max(1, items.length)}
        max={1}
        className={cn("shrink-0", open && "text-fd-primary")}
      />
      <span className="grid flex-1 pl-2 *:col-start-1 *:row-start-1 *:my-auto">
        <span
          className={cn(
            "truncate transition-[opacity,translate,color]",
            open && "text-fd-foreground",
            showItem && "pointer-events-none -translate-y-full opacity-0",
          )}
        >
          {path?.name ?? text.toc}
        </span>
        <span
          className={cn(
            "truncate transition-[opacity,translate]",
            !showItem && "pointer-events-none translate-y-full opacity-0",
          )}
        >
          {items[selected]?.title}
        </span>
      </span>
      <HugeiconsIcon
        icon={ArrowDown01Icon}
        strokeWidth={2.0}
        className={cn(
          "mx-0.5 shrink-0 transition-transform",
          open && "rotate-180",
        )}
      />
    </CollapsibleTrigger>
  );
}

interface ProgressCircleProps extends Omit<
  React.ComponentProps<"svg">,
  "strokeWidth"
> {
  value: number;
  strokeWidth?: number;
  size?: number;
  min?: number;
  max?: number;
}

function clamp(input: number, min: number, max: number): number {
  if (input < min) return min;
  if (input > max) return max;
  return input;
}

function ProgressCircle({
  value,
  strokeWidth = 2,
  size = 24,
  min = 0,
  max = 100,
  ...restSvgProps
}: ProgressCircleProps) {
  const normalizedValue = clamp(value, min, max);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (normalizedValue / max) * circumference;
  const circleProps = {
    cx: size / 2,
    cy: size / 2,
    r: radius,
    fill: "none",
    strokeWidth,
  };

  return (
    <svg
      role="progressbar"
      viewBox={`0 0 ${size} ${size}`}
      aria-valuenow={normalizedValue}
      aria-valuemin={min}
      aria-valuemax={max}
      {...restSvgProps}
    >
      <circle {...circleProps} className="stroke-current/25" />
      <circle
        {...circleProps}
        stroke="currentColor"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all"
      />
    </svg>
  );
}

export function PageTOCPopoverContent(props: ComponentProps<"div">) {
  return (
    <CollapsibleContent
      data-toc-popover-content=""
      {...props}
      className={cn("flex max-h-[50vh] flex-col px-4 md:px-6", props.className)}
    >
      {props.children}
    </CollapsibleContent>
  );
}

export function PageLastUpdate({
  date: value,
  ...props
}: Omit<ComponentProps<"p">, "children"> & { date: Date }) {
  const { text } = useI18n();
  const [date, setDate] = useState("");

  useEffect(() => {
    // to the timezone of client
    setDate(value.toLocaleDateString());
  }, [value]);

  return (
    <p
      {...props}
      className={cn("text-sm text-fd-muted-foreground", props.className)}
    >
      {text.lastUpdate} {date}
    </p>
  );
}

type Item = Pick<PageTree.Item, "name" | "description" | "url">;
export interface FooterProps extends ComponentProps<"div"> {
  /**
   * Items including information for the next and previous page
   */
  items?: {
    previous?: Item;
    next?: Item;
  };
}

export function PageFooter({
  items,
  children,
  className,
  ...props
}: FooterProps) {
  const footerList = useFooterItems();
  const pathname = usePathname();
  const { previous, next } = useMemo(() => {
    if (items) return items;

    const idx = footerList.findIndex((item) => isActive(item.url, pathname));

    if (idx === -1) return {};
    return {
      previous: footerList[idx - 1],
      next: footerList[idx + 1],
    };
  }, [footerList, items, pathname]);

  return (
    <>
      <div
        className={cn(
          "@container mt-15 mb-10 flex justify-between gap-4",
          className,
        )}
        {...props}
      >
        {previous ? <FooterItem item={previous} index={0} /> : <div />}
        {next ? <FooterItem item={next} index={1} /> : <div />}
      </div>
      {children}
    </>
  );
}

function FooterItem({ item, index }: { item: Item; index: 0 | 1 }) {
  const { text } = useI18n();
  const Icon = index === 0 ? ArrowLeft01Icon : ArrowRight01Icon;

  return (
    <Link
      href={item.url}
      className={cn(
        "flex h-8 w-fit flex-col items-center justify-center gap-2 rounded-full bg-gray-100 px-3 text-sm text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 @max-lg:col-span-full dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-300",
        index === 1 && "text-end",
      )}
    >
      <div
        className={cn(
          "inline-flex items-center gap-1.5 font-[450]",
          index === 1 && "flex-row-reverse",
        )}
      >
        <HugeiconsIcon
          icon={Icon}
          strokeWidth={2.0}
          className="-mx-1 size-4 shrink-0 rtl:rotate-180"
        />
        <p>{item.name}</p>
      </div>
    </Link>
  );
}

const copyCache = new Map<string, string>();

export function CopyPageMarkdown({ markdownUrl }: { markdownUrl: string }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopy = async () => {
    try {
      setLoading(true);
      const cached = copyCache.get(markdownUrl);
      if (cached) {
        await navigator.clipboard.writeText(cached);
      } else {
        const res = await fetch(markdownUrl);
        const text = await res.text();
        copyCache.set(markdownUrl, text);
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleCopy}
      className="flex h-4 w-full cursor-pointer items-center justify-start gap-1 bg-transparent px-0! text-[13px] leading-5 font-normal text-gray-500 hover:bg-transparent hover:text-gray-600 disabled:opacity-50 dark:text-gray-400 dark:hover:text-gray-300"
    >
      {copied ? "Copied!" : "Copy this page"}
      <HugeiconsIcon
        icon={copied ? Tick02Icon : Copy01Icon}
        strokeWidth={2.0}
        className="size-3.5"
      />
    </button>
  );
}

export type BreadcrumbProps = BreadcrumbOptions & ComponentProps<"div">;

export function PageBreadcrumb({
  includeRoot,
  includeSeparator,
  includePage,
  ...props
}: BreadcrumbProps) {
  const path = useTreePath();
  const { root } = useTreeContext();
  const items = useMemo(() => {
    return getBreadcrumbItemsFromPath(root, path, {
      includePage,
      includeSeparator,
      includeRoot,
    });
  }, [includePage, includeRoot, includeSeparator, path, root]);

  if (items.length === 0) return null;

  return (
    <div
      {...props}
      className={cn(
        "flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500",
        props.className,
      )}
    >
      {items.map((item, i) => {
        const className = cn(
          "truncate",
          i === items.length - 1 &&
            "text-gray-900 dark:text-gray-50 font-medium",
        );

        return (
          <Fragment key={i}>
            {i !== 0 && (
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2.0}
                className="size-3.5 shrink-0"
              />
            )}
            {item.url ? (
              <Link
                href={item.url}
                className={cn(className, "transition-opacity hover:opacity-80")}
              >
                {item.name}
              </Link>
            ) : (
              <span className={className}>{item.name}</span>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
