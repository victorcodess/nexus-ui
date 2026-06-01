"use client";

import {
  createContext,
  useContext,
  type ComponentProps,
  type CSSProperties,
} from "react";
import {
  ArrowDown01Icon,
  CancelCircleIcon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Loading03Icon,
  ToolsIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import {
  CodeBlock,
  CodeBlockContent,
  CodeblockShiki,
} from "@/components/nexus-ui/codeblock-new";

type ToolStatus = "pending" | "ready" | "running" | "completed" | "error";

type ToolMeta = {
  label: string;
  icon: IconSvgElement;
  color: { bg: string; fg: string };
  iconClassName?: string;
};

const TOOL_META: Record<ToolStatus, ToolMeta> = {
  pending: {
    label: "Pending",
    icon: ToolsIcon,
    color: { bg: "var(--color-gray-100)", fg: "var(--color-gray-500)" },
  },
  ready: {
    label: "Ready",
    icon: Clock01Icon,
    color: { bg: "var(--color-orange-100)", fg: "var(--color-orange-600)" },
  },
  running: {
    label: "Running",
    icon: Loading03Icon,
    color: { bg: "var(--color-blue-100)", fg: "var(--color-blue-600)" },
    iconClassName: "animate-spin",
  },
  completed: {
    label: "Completed",
    icon: CheckmarkCircle01Icon,
    color: { bg: "var(--color-green-100)", fg: "var(--color-green-600)" },
  },
  error: {
    label: "Error",
    icon: CancelCircleIcon,
    color: { bg: "var(--color-red-100)", fg: "var(--color-red-600)" },
  },
};

type ToolContextValue = {
  status: ToolStatus;
  meta: ToolMeta;
};

const ToolContext = createContext<ToolContextValue | null>(null);

function isToolStatus(value: unknown): value is ToolStatus {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(TOOL_META, value)
  );
}

function useToolContext(component: string): ToolContextValue {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error(`${component} must be used within <Tool>`);
  }
  return context;
}

function stringifyToolPayload(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (payload === undefined) return "";

  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}

type ToolProps = ComponentProps<typeof Collapsible> & {
  status: ToolStatus;
};

function Tool({ status, className, style, ...props }: ToolProps) {
  const resolvedStatus = isToolStatus(status) ? status : "pending";
  const meta = TOOL_META[resolvedStatus];

  return (
    <ToolContext.Provider value={{ status: resolvedStatus, meta }}>
      <Collapsible
        data-slot="tool"
        className={cn(
          "not-prose w-full max-w-100 border dark:border-accent bg-card",
          "data-[state=closed]:rounded-xl data-[state=open]:rounded-xl",
          className,
        )}
        style={
          {
            "--tool-color": meta.color.fg,
            "--tool-bg": meta.color.bg,
            ...style,
          } as CSSProperties
        }
        {...props}
      />
    </ToolContext.Provider>
  );
}

type ToolTriggerProps = Omit<
  ComponentProps<typeof CollapsibleTrigger>,
  "children"
> & {
  name: string;
};

function ToolTrigger({ name, className, ...props }: ToolTriggerProps) {
  const { meta } = useToolContext("ToolTrigger");

  return (
    <CollapsibleTrigger
      data-slot="tool-trigger"
      className={cn(
        "group flex h-10 w-full cursor-pointer items-center justify-between px-3 py-2",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <HugeiconsIcon
          data-slot="tool-trigger-icon"
          icon={meta.icon}
          strokeWidth={2}
          className={cn("size-4 text-(--tool-color)", meta.iconClassName)}
        />
        <span
          data-slot="tool-trigger-name"
          className="text-sm leading-6 font-[450] text-primary"
        >
          {name}
        </span>
        <Badge
          data-slot="tool-trigger-badge"
          className="h-6 bg-(--tool-bg)/60 font-[450] text-(--tool-color) dark:bg-(--tool-color)/10 dark:text-(--tool-color)"
        >
          {meta.label}
        </Badge>
      </div>

      <HugeiconsIcon
        data-slot="tool-trigger-chevron"
        icon={ArrowDown01Icon}
        strokeWidth={1.75}
        className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
      />
    </CollapsibleTrigger>
  );
}

type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

function ToolContent({ className, ...props }: ToolContentProps) {
  return (
    <CollapsibleContent
      data-slot="tool-content"
      className={cn(
        "flex flex-col gap-6 p-3 pt-4",
        "overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        className,
      )}
      {...props}
    />
  );
}

type ToolPartProps = {
  kind: "input" | "output";
  payload: unknown;
  errorText?: string;
};

function ToolPart({ kind, payload, errorText }: ToolPartProps) {
  const { status } = useToolContext("ToolPart");
  const code = stringifyToolPayload(payload);
  const isOutputError = kind === "output" && status === "error";
  const hasPayload = payload !== undefined && payload !== null;
  const shouldShowCodeblock = !isOutputError || hasPayload;
  const title = kind === "input" ? "Input" : isOutputError ? "Error" : "Output";

  return (
    <div data-slot={`tool-${kind}`} className="flex flex-col gap-3">
      <span
        data-slot={`tool-${kind}-title`}
        className={cn(
          "text-xs leading-4 font-[450] text-muted-foreground uppercase",
          isOutputError && "text-destructive",
        )}
      >
        {title}
      </span>
      {isOutputError ? (
        <div
          data-slot="tool-output-error"
          className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive dark:bg-destructive/10"
        >
          {errorText ?? "Tool execution failed"}
        </div>
      ) : null}
      {shouldShowCodeblock ? (
        <CodeBlock
          data-slot="tool-output-error-codeblock"
          className="rounded-lg"
          keepBackground
        >
          <CodeBlockContent>
            <CodeblockShiki language="json">{code}</CodeblockShiki>
          </CodeBlockContent>
        </CodeBlock>
      ) : null}
    </div>
  );
}

type ToolPayloadProps = {
  payload: unknown;
};

function ToolInput({ payload }: ToolPayloadProps) {
  return <ToolPart kind="input" payload={payload} />;
}

type ToolOutputProps = ToolPayloadProps & {
  showWhen?: ToolStatus[];
  errorText?: string;
};

function ToolOutput({
  payload,
  showWhen = ["completed"],
  errorText,
}: ToolOutputProps) {
  const { status } = useToolContext("ToolOutput");
  if (!showWhen.includes(status)) return null;

  return <ToolPart kind="output" payload={payload} errorText={errorText} />;
}

export type { ToolStatus };
export { Tool, ToolTrigger, ToolContent, ToolInput, ToolOutput };
