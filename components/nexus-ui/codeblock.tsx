"use client";

/**
 * Streamdown `components.code` for fenced blocks (Shiki via {@link @streamdown/code}).
 * Chrome matches the docs site `CodeBlock` layout (`components/codeblock.tsx`): copy,
 * `keepBackground`, figure + scroll viewport. No collapse/tabs.
 *
 * Optional: wrap Streamdown with {@link NexusCodeBlockChromeProvider} for `allowCopy` /
 * `keepBackground`. Also set `components.inlineCode` per
 * [Streamdown](https://streamdown.ai/docs/components#inline-code).
 */

import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { code as codeHighlighter } from "@streamdown/code";
import type { Element as HastElement } from "hast";
import {
  type ComponentProps,
  createContext,
  type CSSProperties,
  type DetailedHTMLProps,
  type HTMLAttributes,
  type ReactNode,
  isValidElement,
  memo,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  BundledLanguage,
  CodeHighlighterPlugin,
  ExtraProps,
} from "streamdown";
import { StreamdownContext, useIsCodeFenceIncomplete } from "streamdown";
import { cn } from "@/lib/utils";

type NexusCodeBlockChromeOptions = {
  allowCopy: boolean;
  keepBackground: boolean;
};

const defaultChrome: NexusCodeBlockChromeOptions = {
  allowCopy: true,
  keepBackground: false,
};

const NexusCodeBlockChromeContext =
  createContext<NexusCodeBlockChromeOptions>(defaultChrome);

/** Optional: set `keepBackground` / `allowCopy` for {@link NexusCodeBlock} under Streamdown. */
export function NexusCodeBlockChromeProvider({
  children,
  allowCopy = defaultChrome.allowCopy,
  keepBackground = defaultChrome.keepBackground,
}: {
  children: React.ReactNode;
  allowCopy?: boolean;
  keepBackground?: boolean;
}) {
  const value = useMemo(
    () => ({ allowCopy, keepBackground }),
    [allowCopy, keepBackground],
  );
  return (
    <NexusCodeBlockChromeContext.Provider value={value}>
      {children}
    </NexusCodeBlockChromeContext.Provider>
  );
}

function CodeBlockCopyButton({
  text,
  keepBackground,
  showGlow = false,
  className,
}: {
  text: string;
  keepBackground: boolean;
  /** Docs: gradient halo only for floating (untitled) placement. */
  showGlow?: boolean;
  className?: string;
}) {
  const [checked, onClick] = useCopyButton(() => {
    void navigator.clipboard.writeText(text);
  });

  return (
    <div className="relative">
      {showGlow ? (
        <div
          className={cn(
            "pointer-events-none absolute top-1/2 left-1/2 z-0 size-13.5 -translate-x-1/2 -translate-y-1/2 rounded-l-full rounded-tr-full bg-linear-to-l",
            keepBackground
              ? "from-gray-100 from-70% to-gray-100/0 dark:from-gray-950 dark:to-gray-950/0"
              : "from-white from-70% to-white/0 dark:from-gray-900 dark:to-gray-900/0",
          )}
        />
      ) : null}
      <button
        type="button"
        data-checked={checked || undefined}
        className={cn(
          "relative flex size-7 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",
          className,
        )}
        aria-label={checked ? "Copied" : "Copy code"}
        onClick={onClick}
      >
        <span className="flex size-5 items-center justify-center">
          {checked ? (
            <HugeiconsIcon
              icon={Tick02Icon}
              strokeWidth={1.75}
              className="size-4.5"
            />
          ) : (
            <HugeiconsIcon
              icon={Copy01Icon}
              strokeWidth={1.75}
              className="size-4"
            />
          )}
        </span>
      </button>
    </div>
  );
}

const LANGUAGE_REGEX = /language-([^\s]+)/;
const START_LINE_PATTERN = /startLine=(\d+)/;
const NO_LINE_NUMBERS_PATTERN = /\bnoLineNumbers\b/;

function sameNodePosition(prev?: HastElement, next?: HastElement): boolean {
  if (!(prev?.position || next?.position)) return true;
  if (!(prev?.position && next?.position)) return false;
  const ps = prev.position.start;
  const ns = next.position.start;
  const pe = prev.position.end;
  const ne = next.position.end;
  return (
    ps?.line === ns?.line &&
    ps?.column === ns?.column &&
    pe?.line === ne?.line &&
    pe?.column === ne?.column
  );
}

function extractCodeString(children: ReactNode): string {
  if (
    isValidElement(children) &&
    children.props &&
    typeof children.props === "object" &&
    "children" in children.props &&
    typeof (children.props as { children?: unknown }).children === "string"
  ) {
    return (children.props as { children: string }).children;
  }
  if (typeof children === "string") return children;
  return "";
}

function getMetastring(node?: HastElement): string | undefined {
  const raw = node?.properties?.metastring;
  return typeof raw === "string" ? raw : undefined;
}

type MarkdownCodeElementProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> &
  ExtraProps;

type HighlightResult = NonNullable<
  ReturnType<CodeHighlighterPlugin["highlight"]>
>;

function trimTrailingNewlines(str: string): string {
  let end = str.length;
  while (end > 0 && str[end - 1] === "\n") end--;
  return str.slice(0, end);
}

function buildRawHighlightResult(trimmed: string): HighlightResult {
  return {
    bg: "transparent",
    fg: "inherit",
    tokens: trimmed.split("\n").map((line) => [
      {
        content: line,
        color: "inherit",
        bgColor: "transparent",
        htmlStyle: {},
        offset: 0,
      },
    ]),
  };
}

function parseRootStyle(rootStyle: string): Record<string, string> {
  const style: Record<string, string> = {};
  for (const decl of rootStyle.split(";")) {
    const idx = decl.indexOf(":");
    if (idx > 0) {
      const prop = decl.slice(0, idx).trim();
      const val = decl.slice(idx + 1).trim();
      if (prop && val) style[prop] = val;
    }
  }
  return style;
}

type CodeBlockBodyProps = Omit<ComponentProps<"pre">, "children"> & {
  result: HighlightResult;
  language: string;
  lineNumbers?: boolean;
  /** 1-based first line (fence `startLine=`); pairs with `app/global.css` `code .line`. */
  lineNumbersStart?: number;
};

const CodeBlockBody = memo(
  function CodeBlockBody({
    result,
    language,
    className,
    lineNumbers = true,
    lineNumbersStart = 1,
    ...rest
  }: CodeBlockBodyProps) {
    const preStyle = useMemo(() => {
      const style: Record<string, string> = {};
      if (result.bg) style["--sdm-bg"] = result.bg;
      if (result.fg) style["--sdm-fg"] = result.fg;
      if (result.rootStyle && typeof result.rootStyle === "string") {
        Object.assign(style, parseRootStyle(result.rootStyle));
      }
      return style as CSSProperties;
    }, [result.bg, result.fg, result.rootStyle]);

    return (
      <pre
        className={cn(
          "w-max min-w-full *:flex *:flex-col bg-(--sdm-bg,inherit) dark:bg-(--shiki-dark-bg,var(--sdm-bg,inherit))",
          className,
        )}
        data-language={language}
        data-slot="nexus-code-block-body"
        style={preStyle}
        {...rest}
      >
        <code
          style={
            lineNumbers
              ? ({
                  counterSet: `line ${Number(lineNumbersStart) - 1}`,
                } satisfies CSSProperties)
              : undefined
          }
        >
          {result.tokens.map((row, rowIndex) => (
            <span
              key={rowIndex}
              className={lineNumbers ? "line block" : "block"}
            >
              {row.length === 0 || (row.length === 1 && row[0].content === "")
                ? "\n"
                : row.map((token, tokenIndex) => {
                    const tokenStyle: Record<string, string> = {};
                    let hasBg = Boolean(token.bgColor);
                    if (token.color) tokenStyle["--sdm-c"] = token.color;
                    if (token.bgColor)
                      tokenStyle["--sdm-tbg"] = token.bgColor;
                    if (token.htmlStyle) {
                      for (const [key, value] of Object.entries(
                        token.htmlStyle,
                      )) {
                        if (value == null) continue;
                        if (key === "color") {
                          tokenStyle["--sdm-c"] = String(value);
                        } else if (key === "background-color") {
                          tokenStyle["--sdm-tbg"] = String(value);
                          hasBg = true;
                        } else {
                          tokenStyle[key] = String(value);
                        }
                      }
                    }
                    const htmlAttrs = (
                      token as {
                        htmlAttrs?: Record<string, string | undefined>;
                      }
                    ).htmlAttrs;
                    return (
                      <span
                        key={tokenIndex}
                        className={cn(
                          "text-(--sdm-c,inherit)",
                          "dark:text-(--shiki-dark,var(--sdm-c,inherit))",
                          hasBg && "bg-(--sdm-tbg)",
                          hasBg && "dark:bg-(--shiki-dark-bg,var(--sdm-tbg))",
                        )}
                        style={tokenStyle as CSSProperties}
                        {...htmlAttrs}
                      >
                        {token.content}
                      </span>
                    );
                  })}
            </span>
          ))}
        </code>
      </pre>
    );
  },
  (prev, next) =>
    prev.result === next.result &&
    prev.language === next.language &&
    prev.className === next.className &&
    prev.lineNumbers === next.lineNumbers &&
    prev.lineNumbersStart === next.lineNumbersStart,
);

function HighlightedCodeBlockBody({
  code,
  language,
  raw,
  className,
  lineNumbers,
  lineNumbersStart,
  codePlugin,
}: {
  code: string;
  language: string;
  raw: HighlightResult;
  className?: string;
  lineNumbers?: boolean;
  lineNumbersStart?: number;
  codePlugin: CodeHighlighterPlugin;
}) {
  const { shikiTheme } = useContext(StreamdownContext);
  const [result, setResult] = useState<HighlightResult>(raw);

  useEffect(() => {
    const sync = codePlugin.highlight(
      {
        code,
        language: language as BundledLanguage,
        themes: shikiTheme,
      },
      (highlighted) => setResult(highlighted),
    );
    if (sync) setResult(sync);
  }, [code, language, shikiTheme, codePlugin, raw]);

  return (
    <CodeBlockBody
      className={className}
      language={language}
      lineNumbers={lineNumbers}
      lineNumbersStart={lineNumbersStart}
      result={result}
    />
  );
}

type FenceCodeBlockViewProps = {
  code: string;
  language: string;
  className?: string;
  isIncomplete?: boolean;
  startLine?: number;
  lineNumbers?: boolean;
  codePlugin?: CodeHighlighterPlugin;
};

function FenceCodeBlockView({
  code,
  language,
  className,
  isIncomplete,
  startLine,
  lineNumbers = true,
  codePlugin = codeHighlighter,
}: FenceCodeBlockViewProps) {
  const { allowCopy, keepBackground } = useContext(NexusCodeBlockChromeContext);
  const trimmed = useMemo(() => trimTrailingNewlines(code), [code]);
  const raw = useMemo(() => buildRawHighlightResult(trimmed), [trimmed]);

  const title = (language || "code").toLowerCase();

  return (
    <figure
      className={cn(
        "my-4 rounded-xl bg-gray-100 dark:bg-background",
        !keepBackground && "border border-gray-200 dark:border-white/10",
        "not-prose relative w-full overflow-hidden text-[13px] font-[450]",
        className,
      )}
      data-incomplete={isIncomplete || undefined}
      data-language={language}
      data-slot="nexus-code-block"
      dir="ltr"
      tabIndex={-1}
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 200px" }}
    >
      <div className="flex h-9.5 items-center gap-2 px-4 text-gray-500 dark:text-gray-400">
        <figcaption className="flex-1 truncate text-[13px] lowercase">
          {title}
        </figcaption>
        {allowCopy ? (
          <div className="-me-2 flex shrink-0 items-center">
            <CodeBlockCopyButton
              text={trimmed}
              keepBackground={keepBackground}
              showGlow={false}
            />
          </div>
        ) : null}
      </div>
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-900">
        <div
          className={cn(
            "fd-scroll-container no-scrollbar overflow-auto overscroll-x-none rounded-t-xl px-4 py-3.5 text-sm leading-6",
            keepBackground
              ? "bg-gray-100! dark:bg-gray-950!"
              : "bg-white dark:bg-gray-900",
          )}
        >
          <HighlightedCodeBlockBody
            code={trimmed}
            codePlugin={codePlugin}
            language={language}
            lineNumbers={lineNumbers}
            lineNumbersStart={startLine ?? 1}
            raw={raw}
          />
        </div>
      </div>
    </figure>
  );
}

/** Streamdown fenced `code` only — use `components.inlineCode` for backtick spans. */
export const NexusCodeBlock = memo(
  function NexusCodeBlock({
    node,
    className,
    children,
  }: MarkdownCodeElementProps) {
    const { lineNumbers: contextLineNumbers } = useContext(StreamdownContext);
    const isIncompleteFence = useIsCodeFenceIncomplete();

    const match = className?.match(LANGUAGE_REGEX);
    const language = match?.[1] ?? "";

    const metastring = getMetastring(node);
    const startLineMatch = metastring?.match(START_LINE_PATTERN);
    const parsedStart = startLineMatch
      ? Number.parseInt(startLineMatch[1], 10)
      : undefined;
    const startLine =
      parsedStart !== undefined && parsedStart >= 1 ? parsedStart : undefined;
    const metaNoLineNumbers = metastring
      ? NO_LINE_NUMBERS_PATTERN.test(metastring)
      : false;
    const showLineNumbers = !metaNoLineNumbers && contextLineNumbers !== false;

    const codeText = extractCodeString(children);

    return (
      <FenceCodeBlockView
        className={className}
        code={codeText}
        codePlugin={codeHighlighter}
        isIncomplete={isIncompleteFence}
        language={language}
        lineNumbers={showLineNumbers}
        startLine={startLine}
      />
    );
  },
  (p, n) => p.className === n.className && sameNodePosition(p.node, n.node),
);
NexusCodeBlock.displayName = "NexusCodeBlock";
