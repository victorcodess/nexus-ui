"use client";

import { FileIcon } from "@react-symbols/icons/utils";
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  createContext,
  useEffect,
  useContext,
  useState,
  type CSSProperties,
  type ComponentProps,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";
import { highlight, Themes } from "@/lib/shiki/highlighter";
import type { BundledLanguage } from "shiki/bundle/web";

const highlighterPromise = highlight();
type DivProps = ComponentProps<"div">;
type CodeBlockProps = DivProps & {
  keepBackground?: boolean;
};
type CodeBlockCopyContextValue = {
  content: string;
  setContent: (value: string) => void;
};
const CodeBlockCopyContext = createContext<CodeBlockCopyContextValue | null>(
  null,
);

interface CodeblockClientShikiProps extends DivProps {
  code?: string;
  language?: string;
  lineNumbers?: boolean;
  children?: ReactNode;
}

type ShikiToken = {
  content: string;
  htmlStyle?: Record<string, string>;
};

const buildRawTokenRows = (input: string): ShikiToken[][] =>
  input.split(/\r?\n/).map((line) => [{ content: line || "\u00A0" }]);

const EMPTY_TOKEN_ROW: ShikiToken[] = [{ content: "\u00A0" }];

const resolveCodeToHighlight = (children: ReactNode, code?: string): string =>
  typeof children === "string"
    ? children
    : Array.isArray(children) &&
        children.length === 1 &&
        typeof children[0] === "string"
      ? children[0]
      : (code ?? "");

const CodeBlock = ({
  children,
  className,
  keepBackground = false,
  ...props
}: CodeBlockProps) => {
  const [copyContent, setCopyContent] = useState("");

  return (
    <CodeBlockCopyContext.Provider
      value={{ content: copyContent, setContent: setCopyContent }}
    >
      <div
        className={cn(
          "not-prose",
          "my-0 flex w-full flex-col overflow-hidden rounded-xl",
          keepBackground
            ? "border-none bg-secondary dark:bg-background"
            : "border bg-card dark:border-accent",
          "text-[13px] font-[450]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </CodeBlockCopyContext.Provider>
  );
};

type CodeBlockHeaderProps = DivProps;

const CodeBlockHeader = ({
  children,
  className,
  ...props
}: CodeBlockHeaderProps) => {
  return (
    <div
      className={cn(
        "not-prose", // Disable Markdown Styles
        "flex h-9.5 items-center justify-between gap-2 px-4",
        "text-fd-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CodeBlockIconProps extends DivProps {
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

type CodeBlockGroupProps = DivProps;

const CodeBlockGroup = ({
  children,
  className,
  ...props
}: CodeBlockGroupProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        "text-fd-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CodeBlockContent = ({ className, children, ...props }: DivProps) => {
  return (
    <div
      className={cn(
        "no-scrollbar max-h-96 overflow-auto overscroll-x-none",
        "rounded-xl px-4 text-sm leading-6",
        "font-mono whitespace-pre",
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
  const setCopyContent = useContext(CodeBlockCopyContext)?.setContent;
  const codeToHighlight = resolveCodeToHighlight(children, code);
  const [tokenRows, setTokenRows] = useState<ShikiToken[][]>(() =>
    buildRawTokenRows(codeToHighlight),
  );

  useEffect(() => {
    setCopyContent?.(codeToHighlight);
  }, [codeToHighlight, setCopyContent]);

  useEffect(() => {
    let cancelled = false;

    async function clientHighlight() {
      const rawRows = buildRawTokenRows(codeToHighlight);
      if (!cancelled) {
        setTokenRows(rawRows);
      }

      if (!codeToHighlight) {
        return;
      }

      try {
        const highlighter = await highlighterPromise;
        const result = await highlighter.codeToTokens(codeToHighlight, {
          lang: language as BundledLanguage,
          themes: {
            light: Themes.light,
            dark: Themes.dark,
          },
        });
        if (!cancelled) {
          setTokenRows((result.tokens ?? rawRows) as ShikiToken[][]);
        }
      } catch {
        if (!cancelled) {
          setTokenRows(rawRows);
        }
      }
    }

    void clientHighlight();

    return () => {
      cancelled = true;
    };
  }, [codeToHighlight, language]);

  return (
    <div
      className={cn(
        "no-scrollbar w-full overflow-auto overscroll-x-none py-0",
        className,
      )}
      {...props}
    >
      <pre
        className={cn(
          "shiki",
          lineNumbers ? "shiki-line-numbers" : "nd-no-line-numbers",
        )}
      >
        <code>
          {tokenRows.map((row, rowIndex) => (
            <span key={`row-${rowIndex}`} className="line">
              {(row.length ? row : EMPTY_TOKEN_ROW).map((token, tokenIndex) => (
                <span
                  key={`token-${rowIndex}-${tokenIndex}`}
                  style={token.htmlStyle as CSSProperties | undefined}
                >
                  {token.content || "\u00A0"}
                </span>
              ))}
              {rowIndex < tokenRows.length - 1 && "\n"}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
};

type CodeBlockCopyButtonProps = ComponentProps<"button">;

const CodeBlockCopyButton = ({
  className,
  ...props
}: CodeBlockCopyButtonProps) => {
  const content = useContext(CodeBlockCopyContext)?.content ?? "";
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error("Failed to copy text: ", err);
      return false;
    }
  };

  useEffect(() => {
    if (!isCopied) return;

    const timeout = setTimeout(() => {
      setIsCopied(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [isCopied]);

  const handleCopy = async () => {
    if (!content) return;
    await copyToClipboard(content);
    setIsCopied(true);
  };

  return (
    <button
      title="Copy to clipboard"
      className={cn(
        "relative flex size-7 cursor-pointer items-center justify-center rounded-full text-ring hover:text-primary",
        "",
        className,
      )}
      onClick={handleCopy}
      {...props}
    >
      {isCopied ? (
        <HugeiconsIcon
          icon={Tick02Icon}
          strokeWidth={2}
          className="size-3.5 animate-in text-green-900 duration-200 zoom-in-50 dark:text-green-400"
        />
      ) : (
        <HugeiconsIcon
          icon={Copy01Icon}
          strokeWidth={2}
          className="size-3.5 animate-in duration-200 zoom-in-50"
        />
      )}
    </button>
  );
};

export {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockIcon,
  CodeBlockGroup,
  CodeBlockContent,
  CodeblockShiki,
  CodeBlockCopyButton,
};
