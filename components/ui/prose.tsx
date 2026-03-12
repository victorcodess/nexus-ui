import { type ElementType, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface ProseProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  className?: string
}

export function Prose({
  as: Component = 'div',
  className,
  ...props
}: ProseProps) {
  return (
    <Component
      className={cn(
        'prose prose-invert max-w-none text-gray-500 dark:text-gray-400 font-[350] text-[15px] leading-7',
        // headings
        'prose-headings:scroll-mt-28 lg:prose-headings:scroll-mt-24 prose-headings:text-gray-900 dark:prose-headings:text-gray-50 prose-headings:font-[450] prose-headings:leading-5.5 prose-h2:tracking-[-0.45px] prose-headings:mb-4 prose-headings:mt-8 prose-h1:text-2xl prose-h2:text-lg prose-h3:text-base prose-h3:leading-4.5 prose-h3:tracking-[-0.4px] prose-h4:text-sm prose-h5:text-xs prose-h6:text-xs',
        // heading links
        'prose-headings:[&_a]:no-underline prose-headings:[&_a]:shadow-none prose-headings:[&_a]:text-inherit',
        // body text
        'prose-p:mb-4 prose-p:mt-4',
        // lead
        'prose-lead:text-gray-900 dark:prose-lead:text-gray-50',
        // links
        'prose-a:text-gray-900 dark:prose-a:text-gray-50 prose-a:font-normal',
        // link underline
        'prose-a:underline prose-a:underline-offset-3',
        // strong
        'prose-strong:text-gray-900 dark:prose-strong:text-gray-50 prose-strong:font-normal',
        // code
        'prose-code:text-gray-900 dark:prose-code:text-gray-50 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:border-none prose-code:rounded-md prose-code:font-[450]',
        '',
        // lists
        'prose-li:my-[-0.5px] prose-li:marker:text-gray-200 dark:prose-li:marker:text-gray-700',
        className,
      )}
      {...props}
    />
  )
}
