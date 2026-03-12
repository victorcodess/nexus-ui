"use client";

import * as React from "react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
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
      "not-prose flex h-9 gap-2 overflow-x-auto text-fd-secondary-foreground dark:border-gray-800",
      props.className,
      framed ? "px-4" : "",
    )}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof Unstyled.TabsTrigger>,
  React.ComponentPropsWithoutRef<typeof Unstyled.TabsTrigger> & {
    framed?: boolean;
  }
>(({ framed, ...props }, ref) => (
  <Unstyled.TabsTrigger
    ref={ref}
    {...props}
    className={cn(
      "inline-flex cursor-pointer items-center gap-2 font-[450] whitespace-nowrap text-gray-400 dark:text-gray-500",
      props.className,
      framed
        ? "border-b border-transparent px-1 py-2 text-[13px] transition-colors hover:text-gray-900 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:border-gray-50 dark:data-[state=active]:text-gray-50 [&_svg]:size-4"
        : "h-8 rounded-full px-3 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-50",
    )}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export function Tabs({
  ref,
  className,
  items,
  label,
  defaultIndex = 0,
  defaultValue = items ? escapeValue(items[defaultIndex]) : undefined,
  framed = true,
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
      {items && (
        <TabsList framed={framed as boolean}>
          {label && (
            <span className="my-auto me-auto text-sm font-medium">{label}</span>
          )}
          {items.map((item) => (
            <TabsTrigger
              key={item}
              value={escapeValue(item)}
              framed={framed as boolean}
            >
              {item}
            </TabsTrigger>
          ))}
        </TabsList>
      )}
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
