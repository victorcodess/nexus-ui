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

import { CodeBlock, CodeBlockContent, CodeblockShiki } from "@/components/nexus-ui/codeblock-new";

type ToolState = "pending" | "ready" | "running" | "completed" | "error";

type ToolMeta = {
  label: string;
  icon: IconSvgElement;
  color: { bg: string; fg: string };
  iconClassName?: string;
};

const TOOL_META: Record<ToolState, ToolMeta> = {
  pending: {
    label: "Pending",
    icon: ToolsIcon,
    color: { bg: "var(--color-gray-100)", fg: "var(--color-gray-600)" },
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
  state: ToolState;
  meta: ToolMeta;
};

const ToolContext = createContext<ToolContextValue | null>(null);

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
  state: ToolState;
};

function Tool({ state, className, style, ...props }: ToolProps) {
  const meta = TOOL_META[state];

  return (
    <ToolContext.Provider value={{ state, meta }}>
      <Collapsible
        data-slot="tool"
        className={cn(
          "not-prose w-full max-w-100 border border-accent",
          "data-[state=closed]:rounded-3xl data-[state=open]:rounded-3xl",
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
          icon={meta.icon}
          strokeWidth={2}
          className={cn("size-4 text-(--tool-color)", meta.iconClassName)}
        />
        <span className="text-sm leading-6 font-[450] text-primary">
          {name}
        </span>
        <Badge className="h-6 bg-(--tool-bg)/80 font-[450] text-(--tool-color) dark:bg-(--tool-color)/10 dark:text-(--tool-color)">
          {meta.label}
        </Badge>
      </div>

      <HugeiconsIcon
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
      className={cn("flex flex-col gap-6 p-3 pt-4", className)}
      {...props}
    />
  );
}

type ToolPartProps = {
  title: string;
  payload: unknown;
};

function ToolPart({ title, payload }: ToolPartProps) {
  const code = stringifyToolPayload(payload);

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs leading-4 font-[450] text-muted-foreground uppercase">
        {title}
      </span>
      <CodeBlock keepBackground>
        <CodeBlockContent>
          <CodeblockShiki language="json">{code}</CodeblockShiki>
        </CodeBlockContent>
      </CodeBlock>
    </div>
  );
}

type ToolPayloadProps = {
  payload: unknown;
};

function ToolInput({ payload }: ToolPayloadProps) {
  return <ToolPart title="Input" payload={payload} />;
}

type ToolOutputProps = ToolPayloadProps & {
  showWhen?: ToolState[];
};

function ToolOutput({ payload, showWhen = ["completed"] }: ToolOutputProps) {
  const { state } = useToolContext("ToolOutput");
  if (!showWhen.includes(state)) return null;

  return <ToolPart title="Output" payload={payload} />;
}

type ToolErrorProps = {
  error: unknown;
  title?: string;
};

function ToolError({ error, title = "Error" }: ToolErrorProps) {
  const { state } = useToolContext("ToolError");
  if (state !== "error") return null;

  return <ToolPart title={title} payload={error} />;
}

export type { ToolState };
export { Tool, ToolTrigger, ToolContent, ToolInput, ToolOutput, ToolError };
