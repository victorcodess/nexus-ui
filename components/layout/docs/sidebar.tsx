"use client";
import * as Base from "../sidebar/base";
import { cn } from "../../../lib/cn";
import { type ComponentProps, useRef } from "react";
import { cva } from "class-variance-authority";
import { createPageTreeRenderer } from "../sidebar/page-tree";
import { createLinkItemRenderer } from "../sidebar/link-item";
import { buttonVariants } from "../../ui/button";
import { SearchToggle } from "../search-toggle";
import { Sidebar as SidebarIcon } from "lucide-react";
import { mergeRefs } from "../../../lib/merge-refs";

const itemVariants = cva(
  "relative flex flex-row items-center gap-2 rounded-full w-fit h-8 px-3 py-2 text-start text-gray-400 font-normal leading-6 wrap-anywhere [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        link: "transition-colors hover:text-gray-400 data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900 font-normal text-sm leading-6 data-[active=true]:hover:transition-colors dark:text-gray-500 dark:data-[active=true]:text-gray-50 dark:data-[active=true]:bg-gray-800",
        button: "transition-colors hover:text-fd-foreground",
      },
    },
  },
);

export {
  SidebarProvider as Sidebar,
  SidebarFolder,
  SidebarCollapseTrigger,
  SidebarViewport,
  SidebarTrigger,
} from "../sidebar/base";

export function SidebarContent({
  ref: refProp,
  className,
  children,
  ...props
}: ComponentProps<"aside">) {
  const ref = useRef<HTMLElement>(null);

  return (
    <Base.SidebarContent>
      {({ collapsed, hovered, ref: asideRef, ...rest }) => (
        <>
          <div
            data-sidebar-placeholder=""
            className="pointer-events-none sticky top-(--fd-docs-row-1) z-20 h-(--fd-docs-height) [grid-area:sidebar] *:pointer-events-auto max-md:hidden md:layout:[--fd-sidebar-width:268px]"
          >
            {collapsed && (
              <div className="absolute inset-y-0 start-0 w-4" {...rest} />
            )}
            <aside
              id="nd-sidebar"
              ref={mergeRefs(ref, refProp, asideRef)}
              data-collapsed={collapsed}
              data-hovered={collapsed && hovered}
              className={cn(
                "absolute inset-y-0 start-0 flex w-full flex-col items-end border-e bg-fd-card text-sm duration-250 *:w-(--fd-sidebar-width)",
                collapsed && [
                  "inset-y-2 w-(--fd-sidebar-width) rounded-xl border transition-transform",
                  hovered
                    ? "translate-x-2 shadow-lg rtl:-translate-x-2"
                    : "-translate-x-(--fd-sidebar-width) rtl:translate-x-full",
                ],
                ref.current &&
                  (ref.current.getAttribute("data-collapsed") === "true") !==
                    collapsed &&
                  "transition-[width,inset-block,translate,background-color]",
                className,
              )}
              {...props}
              {...rest}
            >
              {children}
            </aside>
          </div>
          <div
            data-sidebar-panel=""
            className={cn(
              "fixed start-4 top-[calc(--spacing(4)+var(--fd-docs-row-3))] z-10 flex rounded-xl border bg-fd-muted p-0.5 text-fd-muted-foreground shadow-lg transition-opacity",
              (!collapsed || hovered) && "pointer-events-none opacity-0",
            )}
          >
            <Base.SidebarCollapseTrigger
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "icon-sm",
                  className: "rounded-lg",
                }),
              )}
            >
              <SidebarIcon />
            </Base.SidebarCollapseTrigger>
            <SearchToggle className="rounded-lg" hideIfDisabled />
          </div>
        </>
      )}
    </Base.SidebarContent>
  );
}

export function SidebarDrawer({
  children,
  className,
  ...props
}: ComponentProps<typeof Base.SidebarDrawerContent>) {
  return (
    <>
      <Base.SidebarDrawerOverlay className="fixed inset-0 z-40 backdrop-blur-xs data-[state=closed]:animate-fd-fade-out data-[state=open]:animate-fd-fade-in" />
      <Base.SidebarDrawerContent
        className={cn(
          "fixed inset-y-0 end-0 z-40 flex w-[85%] max-w-[380px] flex-col border-s bg-fd-background text-[0.9375rem] shadow-lg data-[state=closed]:animate-fd-sidebar-out data-[state=open]:animate-fd-sidebar-in",
          className,
        )}
        {...props}
      >
        {children}
      </Base.SidebarDrawerContent>
    </>
  );
}

export function SidebarSeparator({
  className,
  children,
  ...props
}: ComponentProps<"p">) {
  return (
    <Base.SidebarSeparator
      className={cn(
        "px-0 text-xs leading-4 font-normal text-gray-400 dark:text-gray-500",
        className,
      )}
      {...props}
    >
      {children}
    </Base.SidebarSeparator>
  );
}

export function SidebarItem({
  className,
  children,
  ...props
}: ComponentProps<typeof Base.SidebarItem>) {
  return (
    <Base.SidebarItem
      className={cn(itemVariants({ variant: "link" }), className, "")}
      {...props}
    >
      {children}
    </Base.SidebarItem>
  );
}

export function SidebarFolderTrigger({
  className,
  ...props
}: ComponentProps<typeof Base.SidebarFolderTrigger>) {
  const { collapsible } = Base.useFolder()!;

  return (
    <Base.SidebarFolderTrigger
      className={cn(
        itemVariants({ variant: collapsible ? "button" : null }),
        "w-full",
        className,
      )}
      {...props}
    >
      {props.children}
    </Base.SidebarFolderTrigger>
  );
}

export function SidebarFolderLink({
  className,
  ...props
}: ComponentProps<typeof Base.SidebarFolderLink>) {
  return (
    <Base.SidebarFolderLink
      className={cn(itemVariants({ variant: "link" }), "w-full", className)}
      {...props}
    >
      {props.children}
    </Base.SidebarFolderLink>
  );
}

export function SidebarFolderContent({
  className,
  children,
  ...props
}: ComponentProps<typeof Base.SidebarFolderContent>) {
  return (
    <Base.SidebarFolderContent className={className} {...props}>
      {children}
    </Base.SidebarFolderContent>
  );
}

export const SidebarPageTree = createPageTreeRenderer({
  SidebarFolder: Base.SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem,
  SidebarSeparator,
});

export const SidebarLinkItem = createLinkItemRenderer({
  SidebarFolder: Base.SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem,
});
