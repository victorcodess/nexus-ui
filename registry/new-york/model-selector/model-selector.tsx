"use client";

import * as React from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LockIcon,
} from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const triggerVariants = cva(
  "inline-flex h-8 cursor-pointer items-center gap-1 rounded-full px-3 font-normal text-gray-900 dark:text-gray-100 outline-none transition-colors duration-200 ease-out [&>svg:last-child]:transition-transform [&>svg:last-child]:duration-200 data-[state=open]:[&>svg:last-child]:rotate-180",
  {
    variants: {
      variant: {
        filled:
          "bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 data-[state=open]:bg-gray-200 dark:data-[state=open]:bg-gray-700",
        outline:
          "border border-gray-200 dark:border-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-gray-700",
        ghost:
          "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-gray-700",
      },
    },
    defaultVariants: {
      variant: "filled",
    },
  },
);

export type ModelItemData = {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
};

const ModelSelectorContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  items: Map<string, ModelItemData>;
} | null>(null);

function useModelSelectorContext() {
  const ctx = React.useContext(ModelSelectorContext);
  if (!ctx) {
    throw new Error(
      "ModelSelector components must be used within ModelSelector",
    );
  }
  return ctx;
}

function ModelSelector({
  value,
  onValueChange,
  items: itemsProp,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof DropdownMenuPrimitive.Root>,
  "value" | "onValueChange"
> & {
  value: string;
  onValueChange: (value: string) => void;
  items?: Array<{ value: string } & ModelItemData>;
}) {
  const items = React.useMemo(() => {
    if (!itemsProp) return new Map<string, ModelItemData>();
    const m = new Map<string, ModelItemData>();
    for (const { value: v, ...rest } of itemsProp) {
      m.set(v, rest);
    }
    return m;
  }, [itemsProp]);

  const ctx = React.useMemo(
    () => ({ value, onValueChange, items }),
    [value, onValueChange, items],
  );

  return (
    <ModelSelectorContext.Provider value={ctx}>
      <DropdownMenuPrimitive.Root data-slot="model-selector" {...props}>
        {children}
      </DropdownMenuPrimitive.Root>
    </ModelSelectorContext.Provider>
  );
}

ModelSelector.displayName = "ModelSelector";

function ModelSelectorPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal
      data-slot="model-selector-portal"
      {...props}
    />
  );
}

ModelSelectorPortal.displayName = "ModelSelectorPortal";

function ModelSelectorTrigger({
  className,
  children,
  asChild,
  variant = "filled",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger> &
  VariantProps<typeof triggerVariants>) {
  const { value, items } = useModelSelectorContext();
  const selected = items.get(value);

  const defaultContent = (
    <>
      <span className="flex items-center gap-1">
        {selected?.icon && <selected.icon className="size-4 shrink-0" />}
        <span className="truncate">{selected?.title ?? value}</span>
      </span>
      <ChevronDownIcon className="size-4 shrink-0" />
    </>
  );

  const content = children ?? defaultContent;

  let triggerContent = content;
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      children?: React.ReactNode;
    }>;
    triggerContent = React.cloneElement(child, {
      children: child.props.children ?? defaultContent,
    });
  }

  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="model-selector-trigger"
      data-variant={variant}
      asChild={asChild}
      className={cn(triggerVariants({ variant }), className)}
      {...props}
    >
      {triggerContent}
    </DropdownMenuPrimitive.Trigger>
  );
}

ModelSelectorTrigger.displayName = "ModelSelectorTrigger";

function ModelSelectorContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="model-selector-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-48 origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 text-popover-foreground shadow-modal duration-200 ease-out data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:overflow-hidden data-[state=closed]:duration-0 dark:border-gray-700 dark:bg-gray-600 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

ModelSelectorContent.displayName = "ModelSelectorContent";

function ModelSelectorGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="model-selector-group" {...props} />
  );
}

ModelSelectorGroup.displayName = "ModelSelectorGroup";

function ModelSelectorItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/dropdown-menu-item relative flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-sm font-normal text-gray-900 outline-hidden transition-colors duration-0 select-none focus:bg-gray-100 focus:text-gray-900 data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:text-gray-100 dark:focus:bg-gray-700 dark:focus:text-gray-100 dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

ModelSelectorItem.displayName = "ModelSelectorItem";

function ModelSelectorCheckboxItem({
  className,
  children,
  checked,
  icon: Icon,
  title,
  description,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
}) {
  const defaultContent = (
    <>
      {Icon && (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        {title != null && <p className="truncate font-medium">{title}</p>}
        {description != null && (
          <p className="truncate text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <span className="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
    </>
  );

  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="model-selector-checkbox-item"
      className={cn(
        "relative flex min-h-9 cursor-pointer items-center gap-2.5 rounded-md py-3 pr-3 pl-3 text-sm outline-hidden transition-colors duration-0 select-none hover:bg-gray-100 focus:bg-gray-100 focus:text-accent-foreground dark:hover:bg-gray-700 dark:focus:bg-gray-700 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      checked={checked}
      {...props}
    >
      {children ?? defaultContent}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

ModelSelectorCheckboxItem.displayName = "ModelSelectorCheckboxItem";

function ModelSelectorRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="model-selector-radio-group"
      {...props}
    />
  );
}

ModelSelectorRadioGroup.displayName = "ModelSelectorRadioGroup";

function ModelSelectorRadioItem({
  className,
  value,
  children,
  icon: Icon,
  title,
  description,
  disabled,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
}) {
  const defaultContent = (
    <>
      {Icon && (
        <span className="flex shrink-0 items-center justify-center">
          <Icon className="size-4" />
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.25">
        {title != null && (
          <p className="truncate text-sm font-normal">{title}</p>
        )}
        {description != null && (
          <p className="truncate text-xs font-[350] text-gray-400">
            {description}
          </p>
        )}
      </div>
      <span className="pointer-events-none absolute right-3 flex size-4 items-center justify-center">
        {disabled ? (
          <LockIcon className="size-4" />
        ) : (
          <DropdownMenuPrimitive.ItemIndicator>
            <CheckIcon className="size-4" />
          </DropdownMenuPrimitive.ItemIndicator>
        )}
      </span>
    </>
  );

  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="model-selector-radio-item"
      value={value}
      disabled={disabled}
      className={cn(
        "relative flex min-h-9 cursor-pointer items-center gap-2 rounded-md py-2 pr-9 pl-3 text-sm outline-hidden transition-colors duration-0 select-none focus:bg-gray-100 focus:text-accent-foreground dark:focus:bg-gray-700 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children ?? defaultContent}
    </DropdownMenuPrimitive.RadioItem>
  );
}

ModelSelectorRadioItem.displayName = "ModelSelectorRadioItem";

function ModelSelectorLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="model-selector-label"
      data-inset={inset}
      className={cn(
        "px-3 py-2 text-xs font-[450] text-gray-400 data-inset:pl-8",
        className,
      )}
      {...props}
    />
  );
}

ModelSelectorLabel.displayName = "ModelSelectorLabel";

function ModelSelectorSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="model-selector-separator"
      className={cn(
        "mx-auto my-2 h-px w-[calc(100%-24px)] bg-gray-200 transition-opacity duration-150 dark:bg-gray-500",
        className,
      )}
      {...props}
    />
  );
}

ModelSelectorSeparator.displayName = "ModelSelectorSeparator";

function ModelSelectorSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return (
    <DropdownMenuPrimitive.Sub data-slot="model-selector-sub" {...props} />
  );
}

ModelSelectorSub.displayName = "ModelSelectorSub";

function ModelSelectorSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="model-selector-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-hidden transition-colors duration-0 select-none focus:bg-gray-100 focus:text-accent-foreground data-inset:pl-8 data-[state=open]:bg-gray-100 data-[state=open]:text-accent-foreground dark:focus:bg-gray-700 dark:data-[state=open]:bg-gray-700 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-gray-900 dark:[&_svg:not([class*='text-'])]:text-gray-100 [&>svg:last-child]:transition-transform [&>svg:last-child]:duration-200 data-[state=open]:[&>svg:last-child]:rotate-90",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

ModelSelectorSubTrigger.displayName = "ModelSelectorSubTrigger";

function ModelSelectorSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="model-selector-sub-content"
      className={cn(
        "z-50 min-w-32 origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-lg border border-gray-200 bg-white p-1 text-popover-foreground shadow-modal duration-200 ease-out data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:duration-0 dark:border-gray-700 dark:bg-gray-600 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className,
      )}
      {...props}
    />
  );
}

ModelSelectorSubContent.displayName = "ModelSelectorSubContent";

export {
  ModelSelector,
  ModelSelectorPortal,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorGroup,
  ModelSelectorLabel,
  ModelSelectorItem,
  ModelSelectorCheckboxItem,
  ModelSelectorRadioGroup,
  ModelSelectorRadioItem,
  ModelSelectorSeparator,
  ModelSelectorSub,
  ModelSelectorSubTrigger,
  ModelSelectorSubContent,
};
