import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { CodeBlock, CodeBlockTab, CodeBlockTabs, CodeBlockTabsList, CodeBlockTabsTrigger } from './components/codeblock';
import { Pre } from 'fumadocs-ui/components/codeblock';
import { Tab, Tabs } from './components/tabs';
import { TypeTable } from './components/type-table';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
    Tab,
    Tabs,
    TypeTable,
    CodeBlockTab,
    CodeBlockTabs,
    CodeBlockTabsList,
    CodeBlockTabsTrigger,
    table: (props) => (
      <div
        className={[
          'overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 prose-no-margin my-6 dark:border-white/10 dark:bg-white/5',
          '[&_tbody_tr:first-child_td:first-child]:rounded-tl-xl',
          '[&_tbody_tr:first-child_td:last-child]:rounded-tr-xl',
          '[&_tbody_tr:last-child_td:first-child]:rounded-bl-xl',
          '[&_tbody_tr:last-child_td:last-child]:rounded-br-xl',
        ].join(' ')}
      >
        <table className="w-full text-sm border-separate border-spacing-0 border-none" {...props} />
      </div>
    ),
    th: (props) => (
      <th
        className="px-6 py-2.5 text-left font-[350]! text-[14px] text-gray-400! border-none"
        {...props}
      />
    ),
    td: (props) => (
      <td
        className="px-6 py-3.5 bg-white border-0 text-[14px] [tr:not(:first-child)_&]:border-t border-gray-100 dark:bg-background dark:border-white/10"
        {...props}
      />
    ),
    pre: ({ ref: _ref, ...props }) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
  };
}
