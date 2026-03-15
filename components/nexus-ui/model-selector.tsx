"use client";

import * as React from "react";
import { CheckIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

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
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
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
      asChild={asChild}
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-full bg-gray-100 px-3 font-normal text-gray-900 outline-none",
        className,
      )}
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
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-48 origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg border border-gray-200 bg-white p-0.5 text-popover-foreground shadow-modal",
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
  icon: Icon,
  title,
  description,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
}) {
  const hasDefaultContent = Icon || title != null || description != null;

  const defaultContent = hasDefaultContent ? (
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
    </>
  ) : null;

  return (
    <DropdownMenuPrimitive.Item
      data-slot="model-selector-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "relative flex cursor-default items-center gap-2.5 rounded-md min-h-9 hover:bg-gray-100 py-3 pr-3 pl-3 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!",
        className,
      )}
      {...props}
    >
      {children ?? defaultContent}
    </DropdownMenuPrimitive.Item>
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
         "relative flex cursor-default items-center gap-2.5 rounded-md min-h-9 hover:bg-gray-100 py-3 pr-3 pl-3 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
      <div className="min-w-0 flex-1 flex flex-col gap-0.25">
        {title != null && <p className="truncate font-normal text-sm">{title}</p>}
        {description != null && (
          <p className="truncate text-xs font-[350] text-gray-400">
            {description}
          </p>
        )}
      </div>
      <span className="pointer-events-none absolute right-3 flex size-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
    </>
  );

  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="model-selector-radio-item"
      value={value}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-md min-h-9 hover:bg-gray-100 py-2 pl-3 pr-9 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
        "px-3 py-1 text-xs font-[450] text-gray-400 data-inset:pl-8",
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
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

ModelSelectorSeparator.displayName = "ModelSelectorSeparator";

function ModelSelectorShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="model-selector-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

ModelSelectorShortcut.displayName = "ModelSelectorShortcut";

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
        "flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
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
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 min-w-32 origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
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
  ModelSelectorShortcut,
  ModelSelectorSub,
  ModelSelectorSubTrigger,
  ModelSelectorSubContent,
};
