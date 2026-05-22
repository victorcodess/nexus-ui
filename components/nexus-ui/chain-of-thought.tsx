"use client";

import * as React from "react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useOnChange } from "@/lib/use-on-change";
import { cn } from "@/lib/utils";

type ChainOfThoughtRootContextValue = {
  registerStep: (id: string, status: ChainOfThoughtStepStatus) => void;
  allStepsComplete: boolean;
  hasAnyError: boolean;
};

const ChainOfThoughtRootContext =
  React.createContext<ChainOfThoughtRootContextValue | null>(null);

function useChainOfThoughtRootContext(component: string) {
  const ctx = React.useContext(ChainOfThoughtRootContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <ChainOfThought>`);
  }
  return ctx;
}

type ChainOfThoughtStepContextValue = {
  status: ChainOfThoughtStepStatus;
  hasContent: boolean;
};

const ChainOfThoughtStepContext =
  React.createContext<ChainOfThoughtStepContextValue | null>(null);

function useChainOfThoughtStepContext(component: string) {
  const ctx = React.useContext(ChainOfThoughtStepContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <ChainOfThoughtStep>`);
  }
  return ctx;
}

type ChainOfThoughtStepStatus = "pending" | "active" | "completed" | "error";

type ChainOfThoughtProps = Omit<
  React.ComponentProps<typeof Collapsible>,
  "open" | "defaultOpen" | "onOpenChange"
> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  autoCloseOnAllComplete?: boolean;
};

function ChainOfThought({
  className,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  autoCloseOnAllComplete = true,
  children,
  ...props
}: ChainOfThoughtProps) {
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [stepStatuses, setStepStatuses] = React.useState<
    Record<string, ChainOfThoughtStepStatus>
  >({});

  const { allStepsComplete, hasAnyError } = React.useMemo(() => {
    const statuses = Object.values(stepStatuses);
    return {
      allStepsComplete:
        statuses.length > 0 && statuses.every((status) => status === "completed"),
      hasAnyError: statuses.some((status) => status === "error"),
    };
  }, [stepStatuses]);

  const open = isControlled ? openProp : internalOpen;

  const registerStep = React.useCallback(
    (id: string, status: ChainOfThoughtStepStatus) => {
      setStepStatuses((prev) => {
        if (prev[id] === status) return prev;
        return { ...prev, [id]: status };
      });
    },
    [],
  );

  const contextValue = React.useMemo(
    () => ({ registerStep, allStepsComplete, hasAnyError }),
    [allStepsComplete, hasAnyError, registerStep],
  );

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  useOnChange(allStepsComplete, (current, previous) => {
    if (!autoCloseOnAllComplete || isControlled) return;
    if (!previous && current) {
      setInternalOpen(false);
      onOpenChange?.(false);
    }
  });

  return (
    <ChainOfThoughtRootContext.Provider value={contextValue}>
      <Collapsible
        data-slot="chain-of-thought"
        className={cn("not-prose w-full", className)}
        open={open}
        onOpenChange={handleOpenChange}
        {...props}
      >
        {children}
      </Collapsible>
    </ChainOfThoughtRootContext.Provider>
  );
}

type ChainOfThoughtTriggerProps = React.ComponentProps<
  typeof CollapsibleTrigger
> & {
  label?: React.ReactNode;
  icon?: React.ReactNode;
};

function ChainOfThoughtTrigger({
  className,
  icon,
  label,
  children,
  ...props
}: ChainOfThoughtTriggerProps) {
  const { allStepsComplete, hasAnyError } = useChainOfThoughtRootContext(
    "ChainOfThoughtTrigger",
  );
  const isActive = !allStepsComplete && !hasAnyError;

  return (
    <CollapsibleTrigger
      data-slot="chain-of-thought-trigger"
      data-active={String(isActive)}
      className={cn(
        "group flex cursor-pointer items-center gap-1.25 text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
      {...props}
    >
      {icon}
      <span
        className={cn(
          "text-sm leading-6",
          "group-data-[active=true]:shimmer group-data-[active=true]:shimmer-repeat-delay-0 group-data-[active=true]:shimmer-spread-50 group-data-[active=true]:not-dark:shimmer-invert",
        )}
      >
        {children ?? label}
      </span>
      <HugeiconsIcon
        icon={ArrowDown01Icon}
        strokeWidth={2}
        className="ml-0.5 size-4 opacity-0 transition-all group-hover:opacity-100 group-data-[state=open]:rotate-180 group-data-[state=open]:opacity-100"
      />
    </CollapsibleTrigger>
  );
}

type ChainOfThoughtContentProps = React.ComponentProps<
  typeof CollapsibleContent
>;

function ChainOfThoughtContent({
  className,
  children,
  ...props
}: ChainOfThoughtContentProps) {
  return (
    <CollapsibleContent
      data-slot="chain-of-thought-content"
      className={cn(
        "mt-3 space-y-3",
        "overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        className,
      )}
      {...props}
    >
      {children}
    </CollapsibleContent>
  );
}

type ChainOfThoughtStepProps = Omit<
  React.ComponentProps<typeof Collapsible>,
  "open" | "defaultOpen" | "onOpenChange"
> & {
  status?: ChainOfThoughtStepStatus;
  hasContent?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  autoCloseOnComplete?: boolean;
};

function ChainOfThoughtStep({
  className,
  status = "pending",
  hasContent = false,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  autoCloseOnComplete = true,
  children,
  ...props
}: ChainOfThoughtStepProps) {
  const { registerStep } = useChainOfThoughtRootContext("ChainOfThoughtStep");
  const stepId = React.useId();
  const isControlled = openProp !== undefined;
  const canAutoManageOpen = !isControlled && hasContent;
  const [internalOpen, setInternalOpen] = React.useState(
    () => defaultOpen || (hasContent && (status === "active" || status === "error")),
  );
  const open = isControlled ? openProp : internalOpen;

  React.useEffect(() => {
    registerStep(stepId, status);
  }, [registerStep, status, stepId]);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  useOnChange(status, (current, previous) => {
    if (
      canAutoManageOpen &&
      (current === "active" || current === "error") &&
      previous !== current
    ) {
      setInternalOpen(true);
      onOpenChange?.(true);
      return;
    }

    if (
      !canAutoManageOpen ||
      !autoCloseOnComplete ||
      previous === undefined
    ) {
      return;
    }

    if (previous !== "completed" && current === "completed") {
      setInternalOpen(false);
      onOpenChange?.(false);
    }
  });

  return (
    <ChainOfThoughtStepContext.Provider value={{ status, hasContent }}>
      <Collapsible
        data-slot="chain-of-thought-step"
        className={cn("w-full", className)}
        open={open}
        onOpenChange={handleOpenChange}
        {...props}
      >
        {children}
      </Collapsible>
    </ChainOfThoughtStepContext.Provider>
  );
}

type ChainOfThoughtStepTitleSharedProps = {
  label?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  collapsible?: boolean;
};

type ChainOfThoughtStepTitleCollapsibleProps =
  ChainOfThoughtStepTitleSharedProps &
    Omit<React.ComponentProps<typeof CollapsibleTrigger>, "children"> & {
      collapsible: true;
    };

type ChainOfThoughtStepTitleStaticProps = ChainOfThoughtStepTitleSharedProps &
  React.HTMLAttributes<HTMLDivElement> & {
    collapsible?: false;
  };

type ChainOfThoughtStepTitleProps =
  | ChainOfThoughtStepTitleCollapsibleProps
  | ChainOfThoughtStepTitleStaticProps;

function ChainOfThoughtStepTitle({
  className,
  label: labelProp,
  icon,
  collapsible,
  children,
  ...props
}: ChainOfThoughtStepTitleProps) {
  const { hasContent, status } = useChainOfThoughtStepContext(
    "ChainOfThoughtStepTitle",
  );
  const isCollapsible = collapsible ?? hasContent;
  const isActive = status === "active";
  const isError = status === "error";
  const label = children ?? labelProp;

  if (!isCollapsible) {
    const staticProps = props as React.HTMLAttributes<HTMLDivElement>;

    return (
      <div
        data-slot="chain-of-thought-step-title"
        data-active={String(isActive)}
        className={cn(
          "group flex items-center text-sm leading-4.5 text-muted-foreground",
          isError && "text-destructive",
          icon ? "gap-2" : "gap-0",
          className,
        )}
        {...staticProps}
      >
        {icon ? <div className="relative mt-0.25">{icon}</div> : null}
        <span className="text-sm leading-4.5 group-data-[active=true]:shimmer group-data-[active=true]:shimmer-repeat-delay-0 group-data-[active=true]:shimmer-spread-50 group-data-[active=true]:not-dark:shimmer-invert">
          {label}
        </span>
      </div>
    );
  }

  return (
    <CollapsibleTrigger
      data-slot="chain-of-thought-step-title"
      data-active={String(isActive)}
      className={cn(
        "group flex w-full cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground",
        isError && "text-destructive hover:text-destructive/90",
        "gap-2",
        className,
      )}
      {...(props as Omit<
        React.ComponentProps<typeof CollapsibleTrigger>,
        "children"
      >)}
    >
      {icon ? <div className="relative mt-0.25">{icon}</div> : null}
      <div className="flex min-w-0 flex-1 items-center gap-1.25 overflow-hidden">
        <span className="text-sm leading-4.5 group-data-[active=true]:shimmer group-data-[active=true]:shimmer-repeat-delay-0 group-data-[active=true]:shimmer-spread-50 group-data-[active=true]:not-dark:shimmer-invert">
          {label}
        </span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          className="ml-0.5 size-4 opacity-0 transition-all group-hover:opacity-100 group-data-[state=open]:rotate-180 group-data-[state=open]:opacity-100"
        />
      </div>
    </CollapsibleTrigger>
  );
}

type ChainOfThoughtStepContentProps = React.ComponentProps<
  typeof CollapsibleContent
>;

function ChainOfThoughtStepContent({
  className,
  children,
  ...props
}: ChainOfThoughtStepContentProps) {
  return (
    <CollapsibleContent
      data-slot="chain-of-thought-step-content"
      className={cn(
        "mt-2",
        "overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        className,
      )}
      {...props}
    >
      {children}
    </CollapsibleContent>
  );
}

type ChainOfThoughtCompleteProps = React.HTMLAttributes<HTMLDivElement> & {
  icon?: React.ReactNode;
  label: React.ReactNode;
};

function ChainOfThoughtComplete({
  className,
  icon,
  label,
  ...props
}: ChainOfThoughtCompleteProps) {
  return (
    <div
      data-slot="chain-of-thought-complete"
      className={cn(
        "mt-0 flex animate-in items-center gap-2 text-sm leading-4.5 text-muted-foreground",
        !icon && "gap-0",
        className,
      )}
      {...props}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

export type { ChainOfThoughtStepStatus };
export {
  ChainOfThought,
  ChainOfThoughtTrigger,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtStepTitle,
  ChainOfThoughtStepContent,
  ChainOfThoughtComplete,
};
