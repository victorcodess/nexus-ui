'use client';
import type { ComponentProps } from 'react';
import { Search } from 'lucide-react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { cn } from '../../lib/cn';
import { type ButtonProps, buttonVariants } from '../ui/button';

interface SearchToggleProps extends Omit<ComponentProps<'button'>, 'variant'>, ButtonProps {
  hideIfDisabled?: boolean;
}

export function SearchToggle({
  hideIfDisabled,
  size = 'icon-sm',
  variant = 'ghost',
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
      <Search className="size-4.5" />
    </button>
  );
}

export function LargeSearchToggle({
  hideIfDisabled,
  ...props
}: ComponentProps<'button'> & {
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
        'inline-flex items-center gap-2 rounded-full border bg-white p-1.5 ps-2 pe-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent/10 cursor-pointer hover:text-fd-accent-foreground w-[240px]',
        props.className,
      )}
      onClick={() => {
        setOpenSearch(true);
      }}
    >
      <Search className="size-4" />
      {text.search}
      <div className="ms-auto inline-flex gap-1">
        {hotKey.map((k, i) => (
          <kbd key={i} className="rounded-sm size-5 text-sm inline-flex items-center justify-center border bg-fd-background/50">
            {k.display}
          </kbd>
        ))}
      </div>
    </button>
  );
}
