"use client";

import { FileIcon } from "@react-symbols/icons/utils";
import { useEffect, useState, type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { highlight, Themes } from "@/lib/shiki/highlighter";

interface CodeblockClientShikiProps extends ComponentProps<"div"> {
  code?: string;
  language?: string;
  lineNumbers?: boolean;
  children?: ReactNode;
}

const CodeBlock = ({
  children,
  className,
  ...props
}: ComponentProps<"div">) => {
  return (
    <div
      className={cn(
        "not-prose",
        "flex w-full flex-col overflow-clip rounded-lg shadow-xs",
        "bg-neutral-200/40 dark:bg-neutral-800/70",
        "border border-neutral-200 dark:border-neutral-800",
        "text-neutral-950 dark:text-neutral-50",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

type CodeBlockHeaderProps = ComponentProps<"div">;

const CodeBlockHeader = ({
  children,
  className,
  ...props
}: CodeBlockHeaderProps) => {
  return (
    <div
      className={cn(
        "not-prose", // Disable Markdown Styles
        "flex h-9 items-center justify-between px-2 py-1.5",
        "text-sm text-neutral-600 dark:text-neutral-400",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CodeBlockIconProps extends ComponentProps<"div"> {
  language?: string;
}

const CodeBlockIcon = ({ language, className }: CodeBlockIconProps) => {
  return (
    <FileIcon
      width={16}
      height={16}
      fileName={`.${language ?? ""}`}
      autoAssign={true}
      className={cn(className)}
    />
  );
};

type CodeBlockGroupProps = ComponentProps<"div">;

const CodeBlockGroup = ({
  children,
  className,
  ...props
}: CodeBlockGroupProps) => {
  return (
    <div
      className={cn(
        "flex items-center space-x-2",
        "text-sm text-neutral-600 dark:text-neutral-400",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CodeBlockContent = ({
  className,
  children,
  ...props
}: ComponentProps<"div">) => {
  return (
    <div
      className={cn(
        "max-h-96 overflow-y-auto",
        "bg-white dark:bg-neutral-900",
        "rounded-lg font-mono text-sm leading-5 whitespace-pre",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CodeblockShiki = ({
  code,
  language = "tsx",
  lineNumbers = false,
  className,
  children,
  ...props
}: CodeblockClientShikiProps) => {
  const shikiInlineClasses = [
    // Theme + base styles
    "[&_pre.shiki]:py-3",
    "[&_pre.shiki]:[font-family:var(--font-mono)]",
    "[&_pre.shiki]:!bg-transparent",
    "[&_pre.shiki_span]:[font-family:var(--font-mono)]",
    "[&_pre.shiki_span]:!bg-transparent",
    "dark:[&_pre.shiki_span]:!text-[var(--shiki-dark)]",
    "[&_pre.shiki_span.line]:px-4",
    "[&_pre.shiki_span.line]:py-0.5",
    // Word wrap
    "[&_pre.shiki-word-wrap]:whitespace-pre-wrap",
    "[&_pre.shiki-word-wrap]:break-words",
    "[&_pre.shiki-word-wrap_span.line]:inline-block",
    "[&_pre.shiki-word-wrap_span.line]:w-full",
    "[&_pre.shiki-word-wrap_span.line]:box-border",
    "[&_pre.shiki-word-wrap_span.line]:pt-[0.2px]",
    "[&_pre.shiki-word-wrap_span.line]:pb-[0.2px]",
    // Line numbers
    "[&_pre.shiki-line-numbers_code]:[counter-reset:step]",
    "[&_pre.shiki-line-numbers_code]:[counter-increment:step_0]",
    "[&_pre.shiki-line-numbers_code_.line::before]:[counter-increment:step]",
    "[&_pre.shiki-line-numbers_code_.line::before]:mr-6",
    "[&_pre.shiki-line-numbers_code_.line::before]:inline-block",
    "[&_pre.shiki-line-numbers_code_.line::before]:border-transparent",
    "[&_pre.shiki-line-numbers_code_.line::before]:text-right",
    "[&_pre.shiki-line-numbers_code_.line::before]:text-xs",
    "[&_pre.shiki-line-numbers_code_.line::before]:whitespace-nowrap",
    "[&_pre.shiki-line-numbers_code_.line::before]:text-neutral-500",
    "[&_pre.shiki-line-numbers_code_.line::before]:content-[counter(step)]",
    // Line highlight
    "[&_pre_span.shiki-line-highlight]:relative",
    "[&_pre_span.shiki-line-highlight]:z-0",
    "[&_pre_span.shiki-line-highlight]:inline-block",
    "[&_pre_span.shiki-line-highlight]:w-full",
    "[&_pre_span.shiki-line-highlight::after]:content-['']",
    "[&_pre_span.shiki-line-highlight::after]:absolute",
    "[&_pre_span.shiki-line-highlight::after]:top-0",
    "[&_pre_span.shiki-line-highlight::after]:left-0",
    "[&_pre_span.shiki-line-highlight::after]:-z-10",
    "[&_pre_span.shiki-line-highlight::after]:h-full",
    "[&_pre_span.shiki-line-highlight::after]:w-full",
    "[&_pre_span.shiki-line-highlight::after]:border-l-2",
    "[&_pre_span.shiki-line-highlight::after]:border-neutral-400",
    "[&_pre_span.shiki-line-highlight::after]:bg-neutral-500/20",
    "[&_pre_span.shiki-line-highlight::after]:opacity-40",
    // Diff notation
    "[&_pre.has-diff_span.line.diff]:relative",
    "[&_pre.has-diff_span.line.diff]:inline-block",
    "[&_pre.has-diff_span.line.diff]:w-full",
    "[&_pre.has-diff_span.line.diff.add]:bg-emerald-300/20",
    "dark:[&_pre.has-diff_span.line.diff.add]:bg-emerald-700/20",
    "[&_pre.has-diff_span.line.diff.add::before]:content-['+']",
    "[&_pre.has-diff_span.line.diff.add::before]:absolute",
    "[&_pre.has-diff_span.line.diff.add::before]:left-2",
    "[&_pre.has-diff_span.line.diff.add::before]:text-green-600",
    "dark:[&_pre.has-diff_span.line.diff.add::before]:text-green-400",
    "[&_pre.has-diff_span.line.diff.remove]:bg-red-300/20",
    "[&_pre.has-diff_span.line.diff.remove]:opacity-70",
    "dark:[&_pre.has-diff_span.line.diff.remove]:bg-red-600/20",
    "[&_pre.has-diff_span.line.diff.remove::before]:content-['-']",
    "[&_pre.has-diff_span.line.diff.remove::before]:absolute",
    "[&_pre.has-diff_span.line.diff.remove::before]:left-2",
    "[&_pre.has-diff_span.line.diff.remove::before]:text-red-600",
    "dark:[&_pre.has-diff_span.line.diff.remove::before]:text-red-400",
    // Focus notation
    "[&_pre.shiki-has-focused_.line:not(.focused)]:opacity-50",
    "[&_pre.shiki-has-focused_.line:not(.focused)]:blur-[0.8px]",
    "[&_pre.shiki-has-focused_.line:not(.focused)]:transition-opacity",
    "[&_pre.shiki-has-focused_.line:not(.focused)]:duration-200",
    "[&_pre.shiki-has-focused_.line:not(.focused)]:ease-in-out",
    "hover:[&_pre.shiki-has-focused_.line:not(.focused)]:opacity-100",
    "hover:[&_pre.shiki-has-focused_.line:not(.focused)]:blur-none",
    // Line anchors
    "[&_pre.shiki-line-anchors_.line:target]:scroll-mt-14",
    "[&_pre.shiki-line-anchors_.line:target]:bg-blue-400/15",
    "dark:[&_pre.shiki-line-anchors_.line:target]:bg-blue-600/15",
    "[&_pre.shiki-line-numbers.shiki-line-anchors_code_.line::before]:cursor-pointer",
    "[&_pre.shiki-line-numbers.shiki-line-anchors_code_.line::before]:transition-colors",
    "[&_pre.shiki-line-numbers.shiki-line-anchors_code_.line::before]:select-none",
    "[&_pre.shiki-line-numbers.shiki-line-anchors_code_.line:hover::before]:text-blue-500",
    "[&_pre.shiki-line-numbers.shiki-line-anchors_code_.line:hover::before]:underline",
    "dark:[&_pre.shiki-line-numbers.shiki-line-anchors_code_.line:hover::before]:text-blue-400",
    // Highlighted words
    "[&_pre_span.shiki-word-highlight]:relative",
    "[&_pre_span.shiki-word-highlight]:z-0",
    "[&_pre_span.shiki-word-highlight]:px-0.5",
    "[&_pre_span.shiki-word-highlight]:inline-block",
    "[&_pre_span.shiki-word-highlight]:rounded-sm",
    "[&_pre_span.shiki-word-highlight::after]:content-['']",
    "[&_pre_span.shiki-word-highlight::after]:absolute",
    "[&_pre_span.shiki-word-highlight::after]:inset-0",
    "[&_pre_span.shiki-word-highlight::after]:-z-10",
    "[&_pre_span.shiki-word-highlight::after]:rounded-sm",
    "[&_pre_span.shiki-word-highlight::after]:bg-neutral-500/25",
  ] as const;

  // Prefer children if provided, fallback to code prop
  const codeToHighlight =
    typeof children === "string"
      ? children
      : Array.isArray(children) &&
          children.length === 1 &&
          typeof children[0] === "string"
        ? children[0]
        : (code ?? "");

  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

  useEffect(() => {
    async function clientHighlight() {
      // If there is no code, render an empty block
      if (!codeToHighlight) {
        setHighlightedHtml("<pre><code></code></pre>");
        return;
      }
      const highlighter = await highlight();
      const html = highlighter.codeToHtml(codeToHighlight, {
        lang: language,
        themes: {
          light: Themes.light,
          dark: Themes.dark,
        },
        transformers: [
          {
            name: "AddLineNumbers",
            pre(node) {
              if (lineNumbers) {
                const shikiStyles = node.properties.class;
                const current = Array.isArray(shikiStyles)
                  ? shikiStyles.join(" ")
                  : String(shikiStyles ?? "");
                node.properties.class = `${current} shiki-line-numbers`.trim();
              }
            },
          },
        ],
      });
      setHighlightedHtml(html);
    }
    void clientHighlight();
  }, [codeToHighlight, language, lineNumbers]);

  const classNames = cn(
    "w-full overflow-x-auto",
    shikiInlineClasses,
    className,
  );

  // SSR fallback
  return highlightedHtml ? (
    <div
      className={classNames}
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      {...props}
    />
  ) : (
    <div className={classNames} {...props}>
      <pre>
        <code>{codeToHighlight}</code>
      </pre>
    </div>
  );
};

export {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockIcon,
  CodeBlockGroup,
  CodeBlockContent,
  CodeblockShiki,
};
