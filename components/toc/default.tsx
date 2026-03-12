'use client';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { cn } from '../../lib/cn';
import { type ComponentProps, useRef } from 'react';
import { mergeRefs } from '../../lib/merge-refs';
import { TocThumb, useTOCItems } from './index';
import * as Primitive from 'fumadocs-core/toc';

export function TOCItems({ ref, className, ...props }: ComponentProps<'div'>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const items = useTOCItems();
  const { text } = useI18n();

  if (items.length === 0)
    return (
      <div className="rounded-lg border bg-gray-100 dark:bg-gray-900 p-3 text-[13px] text-gray-400 dark:text-gray-500">
        {text.tocNoHeadings}
      </div>
    );

  return (
    <>
      <TocThumb
        containerRef={containerRef}
        className="absolute top-(--fd-top) ml-[5px] h-(--fd-height) w-0.5 rounded-full bg-gray-500 dark:bg-gray-400 transition-[top,height] ease-linear"
      />
      <div
        ref={mergeRefs(ref, containerRef)}
        className={cn('flex flex-col border-s-2 border-gray-200 dark:border-gray-800 ml-[5px]', className)}
        {...props}
      >
        {items.map((item) => (
          <TOCItem key={item.url} item={item} />
        ))}
      </div>
    </>
  );
}

function TOCItem({ item }: { item: Primitive.TOCItemType }) {
  return (
    <Primitive.TOCItem
      href={item.url}
      className={cn(
        'prose py-1.5 text-[13px] leading-4 font-[450] text-gray-400 dark:text-gray-500 transition-colors wrap-anywhere first:pt-0 last:pb-0 data-[active=true]:text-gray-600 dark:data-[active=true]:text-gray-300',
        item.depth <= 2 && 'ps-3',
        item.depth === 3 && 'ps-6',
        item.depth >= 4 && 'ps-8',
      )}
    >
      {item.title}
    </Primitive.TOCItem>
  );
}
