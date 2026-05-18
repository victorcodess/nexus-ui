"use client";

import * as React from "react";
import {
  Tick02Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  SquareLock01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cva, type VariantProps } from "class-variance-authority";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const triggerVariants = cva(
  "inline-flex h-8 cursor-pointer items-center gap-1 rounded-full px-3 font-normal text-primary text-sm outline-none transition-all duration-200 ease-out [&>span:last-child]:transition-transform [&>span:last-child]:duration-200 data-[state=open]:[&>span:last-child]:rotate-180",
  {
    variants: {
      variant: {
        filled:
          "bg-muted hover:bg-border",
        outline:
          "border border-input bg-transparent hover:bg-muted data-[state=open]:bg-transparent",
        ghost:
          "bg-transparent hover:bg-muted data-[state=open]:bg-transparent",
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

function matchesModelItemFilter(
  filterQuery: string,
  fields: {
    value?: string;
    title?: string | null;
    description?: string | null;
  },
) {
  const q = filterQuery.trim().toLowerCase();
  if (!q) return true;
  if (fields.value != null && fields.value.toLowerCase().includes(q)) {
    return true;
  }
  if (fields.title?.toLowerCase().includes(q)) return true;
  if (fields.description?.toLowerCase().includes(q)) return true;
  return false;
}

const ModelSelectorContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  items: Map<string, ModelItemData>;
  filterQuery: string;
  setFilterQuery: (query: string) => void;
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
  onOpenChange,
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

  const [filterQuery, setFilterQuery] = React.useState("");

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      onOpenChange?.(open);
      if (!open) setFilterQuery("");
    },
    [onOpenChange],
  );

  const ctx = React.useMemo(
    () => ({
      value,
      onValueChange,
      items,
      filterQuery,
      setFilterQuery,
    }),
    [value, onValueChange, items, filterQuery],
  );

  return (
    <ModelSelectorContext.Provider value={ctx}>
      <DropdownMenuPrimitive.Root
        data-slot="model-selector"
        onOpenChange={handleOpenChange}
        {...props}
      >
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
      <span
        data-slot="model-selector-trigger-content"
        className="flex items-center gap-1"
      >
        {selected?.icon && <selected.icon className="size-4 shrink-0" />}
        <span
          data-slot="model-selector-trigger-title"
          className="truncate text-sm"
        >
          {selected?.title ?? value}
        </span>
      </span>
      <span data-slot="model-selector-trigger-chevron">
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2.0}
          className="size-4 shrink-0"
        />
      </span>
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
          "z-50 max-h-[min(var(--model-selector-content-max-height,500px),var(--radix-dropdown-menu-content-available-height))] min-w-48 origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto overscroll-none rounded-lg border border-accent bg-popover p-1 text-popover-foreground shadow-modal duration-200 ease-out data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:overflow-hidden data-[state=closed]:duration-0 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

ModelSelectorContent.displayName = "ModelSelectorContent";

const ModelSelectorSearch = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(function ModelSelectorSearch(
  {
    className,
    type = "text",
    onKeyDown,
    onPointerDown,
    onChange,
    autoComplete = "off",
    ...props
  },
  ref,
) {
  const { filterQuery, setFilterQuery } = useModelSelectorContext();
  return (
    <div
      data-slot="model-selector-search-wrapper"
      className="sticky top-0 z-10 bg-popover py-1"
      onPointerDown={(e) => {
        e.preventDefault();
      }}
    >
      <HugeiconsIcon
        icon={Search01Icon}
        className="absolute top-1/2 left-2.75 -mb-0.25 size-4 -translate-y-1/2 text-muted-foreground"
        strokeWidth={2}
      />
      <input
        ref={ref}
        type={type}
        data-slot="model-selector-search"
        autoComplete={autoComplete}
        className={cn(
          "inline-flex h-8 w-full items-center gap-2 rounded-[6px] bg-muted p-1.5 ps-8.5 pe-2 text-[13px] leading-6 font-[350] text-muted-foreground transition-all placeholder:text-muted-foreground hover:bg-border/50 focus-visible:ring-2 focus-visible:outline-0 focus-visible:ring-border dark:focus-visible:ring-ring",
          className,
        )}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.key === "Escape") return;
          e.stopPropagation();
        }}
        onPointerDown={(e) => {
          onPointerDown?.(e);
          e.stopPropagation();
        }}
        {...props}
        value={filterQuery}
        onChange={(e) => {
          setFilterQuery(e.target.value);
          onChange?.(e);
        }}
      />
    </div>
  );
});

ModelSelectorSearch.displayName = "ModelSelectorSearch";

function ModelSelectorEmpty({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { filterQuery, items } = useModelSelectorContext();
  const q = filterQuery.trim();
  const hasCatalogMatch = React.useMemo(() => {
    if (!q || items.size === 0) return true;
    for (const [value, data] of items) {
      if (
        matchesModelItemFilter(q, {
          value,
          title: data.title,
          description: data.description,
        })
      ) {
        return true;
      }
    }
    return false;
  }, [q, items]);

  if (!q || hasCatalogMatch) return null;

  return (
    <div data-slot="model-selector-empty" className={cn("flex h-27 w-full items-center justify-center px-3 py-2 text-center text-[13px] font-[350] text-muted-foreground", className)} {...props}>
      {children ?? "No models found"}
    </div>
  );
}

ModelSelectorEmpty.displayName = "ModelSelectorEmpty";

function ModelSelectorGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="model-selector-group" {...props} />
  );
}

ModelSelectorGroup.displayName = "ModelSelectorGroup";

function ModelSelectorItemTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="model-selector-item-title"
      className={cn("truncate", className)}
      {...props}
    />
  );
}

ModelSelectorItemTitle.displayName = "ModelSelectorItemTitle";

function ModelSelectorItemDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="model-selector-item-description"
      className={cn("truncate text-xs", className)}
      {...props}
    />
  );
}

ModelSelectorItemDescription.displayName = "ModelSelectorItemDescription";

function ModelSelectorItemIcon({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="model-selector-item-icon"
      className={cn("flex shrink-0 items-center justify-center", className)}
      {...props}
    />
  );
}

ModelSelectorItemIcon.displayName = "ModelSelectorItemIcon";

function ModelSelectorItemIndicator({
  className,
  children,
  wrapWithItemIndicator = true,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  /** When false, children are rendered directly without ItemIndicator. Use for always-visible content (e.g. LockIcon when disabled). */
  wrapWithItemIndicator?: boolean;
}) {
  return (
    <span
      data-slot="model-selector-item-indicator"
      className={cn(
        "pointer-events-none absolute right-2 flex size-3.5 items-center justify-center",
        className,
      )}
      {...props}
    >
      {wrapWithItemIndicator ? (
        <DropdownMenuPrimitive.ItemIndicator>
          {children}
        </DropdownMenuPrimitive.ItemIndicator>
      ) : (
        children
      )}
    </span>
  );
}

ModelSelectorItemIndicator.displayName = "ModelSelectorItemIndicator";

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
        "group/dropdown-menu-item relative flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-sm font-normal text-primary outline-hidden transition-colors duration-0 select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
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
  disabled,
  indicator,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  disabled?: boolean;
  indicator?: React.ReactNode;
  /** Custom content to show when selected. Renders inside ItemIndicator. Defaults to CheckIcon. */
}) {
  const { filterQuery } = useModelSelectorContext();
  const hasFilterableText = title != null || description != null;
  if (
    hasFilterableText &&
    !matchesModelItemFilter(filterQuery, { title, description })
  ) {
    return null;
  }

  const defaultContent = (
    <>
      {Icon && (
        <ModelSelectorItemIcon className="size-8 rounded-md bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </ModelSelectorItemIcon>
      )}
      <div
        data-slot="model-selector-checkbox-item-content"
        className="min-w-0 flex-1"
      >
        {title != null && (
          <ModelSelectorItemTitle className="font-medium">
            {title}
          </ModelSelectorItemTitle>
        )}
        {description != null && (
          <ModelSelectorItemDescription className="text-muted-foreground">
            {description}
          </ModelSelectorItemDescription>
        )}
      </div>
    </>
  );

  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="model-selector-checkbox-item"
      className={cn(
        "relative flex min-h-9 cursor-pointer items-center gap-2.5 rounded-md py-3 pr-3 pl-3 text-sm outline-hidden transition-colors duration-0 select-none hover:bg-accent focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      checked={checked}
      disabled={disabled}
      {...props}
    >
      {children ?? defaultContent}
      <ModelSelectorItemIndicator
        className="right-3 size-4"
        wrapWithItemIndicator={!disabled}
      >
        {disabled ? (
          <HugeiconsIcon
            icon={SquareLock01Icon}
            strokeWidth={2.0}
            className="size-4 opacity-50"
          />
        ) : (
          (indicator ?? (
            <HugeiconsIcon
              icon={Tick02Icon}
              strokeWidth={2.0}
              className="size-4"
            />
          ))
        )}
      </ModelSelectorItemIndicator>
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
  indicator,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  /** Custom content to show when selected. Renders inside ItemIndicator. Defaults to CheckIcon. */
  indicator?: React.ReactNode;
}) {
  const { filterQuery } = useModelSelectorContext();
  if (
    !matchesModelItemFilter(filterQuery, {
      value,
      title,
      description,
    })
  ) {
    return null;
  }

  const defaultContent = (
    <>
      {Icon && (
        <ModelSelectorItemIcon>
          <Icon className="size-4" />
        </ModelSelectorItemIcon>
      )}
      <div
        data-slot="model-selector-radio-item-content"
        className="flex min-w-0 flex-1 flex-col gap-0.25"
      >
        {title != null && (
          <ModelSelectorItemTitle className="text-sm font-normal">
            {title}
          </ModelSelectorItemTitle>
        )}
        {description != null && (
          <ModelSelectorItemDescription className="font-[350] text-muted-foreground">
            {description}
          </ModelSelectorItemDescription>
        )}
      </div>
    </>
  );

  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="model-selector-radio-item"
      value={value}
      disabled={disabled}
      className={cn(
        "relative flex min-h-9 cursor-pointer items-center gap-2 rounded-md py-2 pr-9 pl-3 text-sm outline-hidden transition-colors duration-0 select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children ?? defaultContent}
      <ModelSelectorItemIndicator
        className="right-3 size-4"
        wrapWithItemIndicator={!disabled}
      >
        {disabled ? (
          <HugeiconsIcon
            icon={SquareLock01Icon}
            strokeWidth={2.0}
            className="size-4 opacity-50"
          />
        ) : (
          (indicator ?? (
            <HugeiconsIcon
              icon={Tick02Icon}
              strokeWidth={2.0}
              className="size-4"
            />
          ))
        )}
      </ModelSelectorItemIndicator>
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
        "px-3 py-2 text-xs font-[450] text-muted-foreground data-inset:pl-8",
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
        "mx-auto my-2 h-px w-[calc(100%-24px)] bg-border transition-opacity duration-150",
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
        "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-hidden transition-colors duration-0 select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-primary [&>svg:last-child]:transition-transform [&>svg:last-child]:duration-200 data-[state=open]:[&>svg:last-child]:rotate-90",
        className,
      )}
      {...props}
    >
      {children}
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        strokeWidth={2.0}
        className="ml-auto size-4"
      />
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
        "z-50 min-w-32 origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden overscroll-none rounded-lg border border-accent bg-popover p-1 text-popover-foreground shadow-modal duration-200 ease-out data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:duration-0 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
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
  ModelSelectorSearch,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorLabel,
  ModelSelectorItemTitle,
  ModelSelectorItemDescription,
  ModelSelectorItemIcon,
  ModelSelectorItemIndicator,
  ModelSelectorItem,
  ModelSelectorCheckboxItem,
  ModelSelectorRadioGroup,
  ModelSelectorRadioItem,
  ModelSelectorSeparator,
  ModelSelectorSub,
  ModelSelectorSubTrigger,
  ModelSelectorSubContent,
};
