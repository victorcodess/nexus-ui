'use client';

import * as React from 'react';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';
import { cn } from '../lib/cn';
import * as Unstyled from './ui/tabs';

type CollectionKey = string | symbol;

export interface TabsProps extends Omit<
  ComponentProps<typeof Unstyled.Tabs>,
  'value' | 'onValueChange'
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
}

const TabsContext = createContext<{
  items?: string[];
  collection: CollectionKey[];
} | null>(null);

function useTabContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('You must wrap your component in <Tabs>');
  return ctx;
}

export const TabsList = React.forwardRef<
  React.ComponentRef<typeof Unstyled.TabsList>,
  React.ComponentPropsWithoutRef<typeof Unstyled.TabsList>
>((props, ref) => (
  <Unstyled.TabsList
    ref={ref}
    {...props}
    className={cn(
      'flex gap-2 text-fd-secondary-foreground overflow-x-auto px-4 not-prose dark:border-white/10 h-9',
      props.className,
    )}
  />
));
TabsList.displayName = 'TabsList';

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof Unstyled.TabsTrigger>,
  React.ComponentPropsWithoutRef<typeof Unstyled.TabsTrigger>
>((props, ref) => (
  <Unstyled.TabsTrigger
    ref={ref}
    {...props}
    className={cn(
      'inline-flex items-center cursor-pointer gap-2 font-[450] whitespace-nowrap text-gray-400 border-b border-transparent py-2 px-1 text-[13px] transition-colors [&_svg]:size-4 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900',
      props.className,
    )}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

export function Tabs({
  ref,
  className,
  items,
  label,
  defaultIndex = 0,
  defaultValue = items ? escapeValue(items[defaultIndex]) : undefined,
  ...props
}: TabsProps) {
  const [value, setValue] = useState(defaultValue);
  const collection = useMemo<CollectionKey[]>(() => [], []);

  return (
    <Unstyled.Tabs
      ref={ref}
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-100 my-4 dark:border-white/10 dark:bg-background',
        className,
      )}
      value={value}
      onValueChange={(v: string) => {
        if (items && !items.some((item) => escapeValue(item) === v)) return;
        setValue(v);
      }}
      {...props}
    >
      {items && (
        <TabsList>
          {label && <span className="text-sm font-medium my-auto me-auto">{label}</span>}
          {items.map((item) => (
            <TabsTrigger key={item} value={escapeValue(item)}>
              {item}
            </TabsTrigger>
          ))}
        </TabsList>
      )}
      <TabsContext.Provider value={useMemo(() => ({ items, collection }), [collection, items])}>
        {props.children}
      </TabsContext.Provider>
    </Unstyled.Tabs>
  );
}

export interface TabProps extends Omit<ComponentProps<typeof Unstyled.TabsContent>, 'value'> {
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
      'Failed to resolve tab `value`, please pass a `value` prop to the Tab component.',
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
        'p-0 text-sm bg-transparent rounded-xl outline-none prose-no-margin data-[state=inactive]:hidden [&>figure:only-child]:m-0 [&>figure:only-child]:border-none [&>figure:only-child]:rounded-none [&>figure:only-child]:shadow-none',
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
  return v.toLowerCase().replace(/\s/, '-');
}
