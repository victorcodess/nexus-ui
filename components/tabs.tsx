"use client";

import * as React from "react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { TerminalIcon } from "@hugeicons/core-free-icons";
import { cn } from "../lib/cn";
import * as Unstyled from "./ui/tabs";

type CollectionKey = string | symbol;

export interface TabsProps extends Omit<
  ComponentProps<typeof Unstyled.Tabs>,
  "value" | "onValueChange"
> {
  /**
   * Use simple mode instead of advanced usage as documented in https://radix-ui.com/primitives/docs/components/tabs.
   */
  items?: string[];

  /**
   * Shortcut for `defaultValue` when `items` is provided.
   *
   * @defaultValue 0
   */
  defaultIndex?: number;

  /**
   * Additional label in tabs list when `items` is provided.
   */
  label?: ReactNode;

  /**
   * Whether to use a framed style for the tabs.
   */
  framed?: boolean;

  /**
   * Show terminal icon before tab triggers in framed simple mode.
   *
   * @defaultValue true
   */
  showTerminalIcon?: boolean;
}

const TabsContext = createContext<{
  items?: string[];
  collection: CollectionKey[];
} | null>(null);

function useTabContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("You must wrap your component in <Tabs>");
  return ctx;
}

export const TabsList = React.forwardRef<
  React.ComponentRef<typeof Unstyled.TabsList>,
  React.ComponentPropsWithoutRef<typeof Unstyled.TabsList> & {
    framed?: boolean;
  }
>(({ framed, ...props }, ref) => (
  <Unstyled.TabsList
    ref={ref}
    {...props}
    className={cn(
      "not-prose flex min-h-0 w-full min-w-0 gap-2 overflow-x-auto overflow-y-hidden dark:border-gray-800",
      framed
        ? "h-9 max-h-9 px-4 text-fd-secondary-foreground"
        : "h-9 text-fd-secondary-foreground",
      props.className,
    )}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof Unstyled.TabsTrigger>,
  React.ComponentPropsWithoutRef<typeof Unstyled.TabsTrigger> & {
    framed?: boolean;
  }
>(({ framed, children, className, ...props }, ref) => (
  <Unstyled.TabsTrigger
    ref={ref}
    {...props}
    className={cn(
      "cursor-pointer items-center gap-2 text-nowrap",
      framed
        ? "inline-flex h-9 max-h-9 shrink-0 cursor-pointer items-center gap-2 border-b border-transparent px-1 py-2 text-[13px] font-[450] whitespace-nowrap text-gray-400 transition-colors hover:text-gray-900 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 dark:text-gray-500 dark:data-[state=active]:border-gray-50 dark:data-[state=active]:text-gray-50 [&_svg]:size-4"
        : "inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-full px-3 font-[450] whitespace-nowrap text-gray-400 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 dark:text-gray-500 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-50",
      className,
    )}
  >
    {children}
  </Unstyled.TabsTrigger>
));
TabsTrigger.displayName = "TabsTrigger";

/** Sliding line matches full trigger width (same as `border-b` on the tab button). */
const TAB_LINE_INSET_PX = 0;

/**
 * Framed simple tabs: sliding underline (no clip-path).
 */
function TabsItemsFramedList({
  items,
  label,
  value,
  showTerminalIcon,
}: {
  items: string[];
  label?: ReactNode;
  value: string | undefined;
  showTerminalIcon: boolean;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const rowRef = React.useRef<HTMLDivElement>(null);
  const activeTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  const [indicator, setIndicator] = React.useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const row = rowRef.current;
    const active = activeTriggerRef.current;
    if (!row || !active) return;

    const rowRect = row.getBoundingClientRect();
    const tabRect = active.getBoundingClientRect();
    if (rowRect.width <= 0 || tabRect.width <= 0) return;

    const left = tabRect.left - rowRect.left + TAB_LINE_INSET_PX;
    const width = Math.max(0, tabRect.width - TAB_LINE_INSET_PX * 2);

    setIndicator({ left, width });
  }, []);

  React.useLayoutEffect(() => {
    updateIndicator();
    const id = requestAnimationFrame(updateIndicator);
    return () => cancelAnimationFrame(id);
  }, [value, items, label, updateIndicator]);

  React.useEffect(() => {
    const scroll = scrollRef.current;
    const row = rowRef.current;
    if (!scroll || !row) return;

    window.addEventListener("resize", updateIndicator);
    scroll.addEventListener("scroll", updateIndicator);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateIndicator)
        : null;
    ro?.observe(row);

    return () => {
      window.removeEventListener("resize", updateIndicator);
      scroll.removeEventListener("scroll", updateIndicator);
      ro?.disconnect();
    };
  }, [updateIndicator]);

  const framedTrigger =
    "inline-flex h-9 max-h-9 shrink-0 box-border cursor-pointer items-center gap-2 border-b border-transparent px-1 py-2 font-[450] text-[13px] whitespace-nowrap text-gray-500 transition-colors hover:text-gray-900 data-[state=active]:text-gray-900 disabled:pointer-events-none disabled:opacity-50 dark:text-gray-500 dark:data-[state=active]:text-gray-50 [&_svg]:size-4";

  return (
    <Unstyled.TabsList
      ref={scrollRef}
      className={cn(
        "not-prose relative no-scrollbar block h-9 max-h-9 w-full min-w-0 overflow-x-auto overflow-y-hidden dark:border-gray-800",
        "px-4 text-fd-secondary-foreground",
      )}
    >
      <div
        ref={rowRef}
        className="relative inline-flex h-9 max-h-9 min-w-min items-center gap-2"
      >
        {label != null && label !== false && (
          <span className="my-auto me-auto shrink-0 text-sm font-medium">
            {label}
          </span>
        )}
        {showTerminalIcon && (
          <HugeiconsIcon
            icon={TerminalIcon}
            strokeWidth={2}
            aria-hidden
            className="size-4 shrink-0 text-fd-muted-foreground"
          />
        )}
        {items.map((item) => {
          const v = escapeValue(item);
          const isActive = value === v;
          return (
            <Unstyled.TabsTrigger
              key={item}
              ref={isActive ? activeTriggerRef : undefined}
              value={v}
              className={framedTrigger}
            >
              {item}
            </Unstyled.TabsTrigger>
          );
        })}

        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute bottom-0 z-1 h-px bg-gray-900 ease-out dark:bg-gray-50",
            "transition-[left,width] duration-200",
            indicator.width <= 0 && "opacity-0",
          )}
          style={{
            left: indicator.left,
            width: indicator.width,
          }}
        />
      </div>
    </Unstyled.TabsList>
  );
}

/**
 * Pill simple tabs: clip-path highlight (homepage model-tab style).
 */
function TabsItemsPillClipList({
  items,
  label,
  value,
}: {
  items: string[];
  label?: ReactNode;
  value: string | undefined;
}) {
  const clipContainerRef = React.useRef<HTMLDivElement>(null);
  const activeTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  const clipTransitionReadyRef = React.useRef(false);

  const updateClipPath = useCallback(() => {
    const container = clipContainerRef.current;
    const activeTabElement = activeTriggerRef.current;
    if (!container || !activeTabElement) return;

    const c = container.getBoundingClientRect();
    const b = activeTabElement.getBoundingClientRect();
    if (c.width <= 0 || c.height <= 0 || b.width <= 0 || b.height <= 0) {
      return;
    }

    const top = b.top - c.top;
    const right = c.right - b.right;
    const bottom = b.bottom - b.bottom;
    const left = b.left - c.left;

    const clipPath = `inset(${Number((top / c.height) * 100).toFixed(3)}% ${Number((right / c.width) * 100).toFixed(3)}% ${Number((bottom / c.height) * 100).toFixed(3)}% ${Number((left / c.width) * 100).toFixed(3)}% round 9999px)`;

    const instant = !clipTransitionReadyRef.current;
    if (instant) {
      container.style.transition = "none";
    }
    container.style.clipPath = clipPath;
    if (instant) {
      void container.offsetHeight;
      container.style.transition = "clip-path 0.2s ease";
      clipTransitionReadyRef.current = true;
    }
  }, []);

  React.useLayoutEffect(() => {
    updateClipPath();
    const id = requestAnimationFrame(() => {
      updateClipPath();
    });
    return () => cancelAnimationFrame(id);
  }, [value, updateClipPath]);

  React.useEffect(() => {
    const handleResize = () => {
      updateClipPath();
    };
    window.addEventListener("resize", handleResize);

    const row = clipContainerRef.current?.parentElement;
    const ro =
      row && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            updateClipPath();
          })
        : null;
    if (row && ro) ro.observe(row);

    return () => {
      window.removeEventListener("resize", handleResize);
      ro?.disconnect();
    };
  }, [updateClipPath]);

  const pillTrigger =
    "inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-full px-3 font-[450] whitespace-nowrap text-gray-400 dark:text-gray-500";

  const overlayCopy =
    "inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-full px-3 font-[450] whitespace-nowrap text-gray-900 dark:text-gray-50";

  return (
    <Unstyled.TabsList
      className={cn(
        "not-prose relative no-scrollbar block w-full min-w-0 overflow-x-auto overflow-y-hidden text-fd-secondary-foreground dark:border-gray-800",
      )}
    >
      <div className="relative inline-flex items-center gap-2 mb-2">
        {label != null && label !== false && (
          <span className="my-auto me-auto shrink-0 text-sm font-medium">
            {label}
          </span>
        )}
        {items.map((item) => {
          const v = escapeValue(item);
          const isActive = value === v;
          return (
            <Unstyled.TabsTrigger
              key={item}
              ref={isActive ? activeTriggerRef : undefined}
              value={v}
              className={cn("group", pillTrigger)}
            >
              {item}
            </Unstyled.TabsTrigger>
          );
        })}

        <div
          aria-hidden
          ref={clipContainerRef}
          className="pointer-events-none absolute inset-0 z-[1] flex items-center gap-2 bg-gray-100 dark:bg-gray-800"
          style={{
            transition: "clip-path 0.2s ease",
            clipPath: "inset(100% 100% 100% 100%)",
          }}
        >
          {label != null && label !== false && (
            <span className="invisible my-auto me-auto shrink-0 text-sm font-medium">
              {label}
            </span>
          )}
          {items.map((item, index) => (
            <span key={`clip-${item}-${index}`} className={overlayCopy}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </Unstyled.TabsList>
  );
}

export function Tabs({
  ref,
  className,
  items,
  label,
  defaultIndex = 0,
  defaultValue = items ? escapeValue(items[defaultIndex]) : undefined,
  framed = true,
  showTerminalIcon = true,
  ...props
}: TabsProps) {
  const [value, setValue] = useState(defaultValue);
  const collection = useMemo<CollectionKey[]>(() => [], []);

  return (
    <Unstyled.Tabs
      ref={ref}
      className={cn(
        "flex flex-col overflow-hidden",
        className,
        framed
          ? "my-4 rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-950"
          : "my-6! gap-3",
      )}
      value={value}
      onValueChange={(v: string) => {
        if (items && !items.some((item) => escapeValue(item) === v)) return;
        setValue(v);
      }}
      {...props}
    >
      {items &&
        (framed ? (
          <TabsItemsFramedList
            items={items}
            label={label}
            value={value}
            showTerminalIcon={showTerminalIcon}
          />
        ) : (
          <TabsItemsPillClipList items={items} label={label} value={value} />
        ))}
      <TabsContext.Provider
        value={useMemo(() => ({ items, collection }), [collection, items])}
      >
        {props.children}
      </TabsContext.Provider>
    </Unstyled.Tabs>
  );
}

export interface TabProps extends Omit<
  ComponentProps<typeof Unstyled.TabsContent>,
  "value"
> {
  /**
   * Value of tab, detect from index if unspecified.
   */
  value?: string;
}

export function Tab({ value, ...props }: TabProps) {
  const { items } = useTabContext();
  const resolved =
    value ??
    // eslint-disable-next-line react-hooks/rules-of-hooks -- `value` is not supposed to change
    items?.at(useCollectionIndex());
  if (!resolved)
    throw new Error(
      "Failed to resolve tab `value`, please pass a `value` prop to the Tab component.",
    );

  return (
    <TabsContent value={escapeValue(resolved)} {...props}>
      {props.children}
    </TabsContent>
  );
}

export function TabsContent({
  value,
  className,
  ...props
}: ComponentProps<typeof Unstyled.TabsContent>) {
  return (
    <Unstyled.TabsContent
      value={value}
      forceMount
      className={cn(
        "prose-no-margin rounded-xl bg-transparent p-0 text-sm outline-none data-[state=inactive]:hidden [&>figure:only-child]:m-0 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-none [&>figure:only-child]:shadow-none",
        className,
      )}
      {...props}
    >
      {props.children}
    </Unstyled.TabsContent>
  );
}

/**
 * Inspired by Headless UI.
 *
 * Return the index of children, this is made possible by registering the order of render from children using React context.
 * This is supposed by work with pre-rendering & pure client-side rendering.
 */
function useCollectionIndex() {
  const key = useId();
  const { collection } = useTabContext();

  useEffect(() => {
    return () => {
      const idx = collection.indexOf(key);
      if (idx !== -1) collection.splice(idx, 1);
    };
  }, [key, collection]);

  if (!collection.includes(key)) collection.push(key);
  return collection.indexOf(key);
}

/**
 * only escape whitespaces in values in simple mode
 */
function escapeValue(v: string): string {
  return v.toLowerCase().replace(/\s/, "-");
}
