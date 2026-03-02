'use client';
import * as Base from '../sidebar/base';
import { cn } from '../../../lib/cn';
import { type ComponentProps, useRef } from 'react';
import { cva } from 'class-variance-authority';
import { createPageTreeRenderer } from '../sidebar/page-tree';
import { createLinkItemRenderer } from '../sidebar/link-item';
import { buttonVariants } from '../../ui/button';
import { SearchToggle } from '../search-toggle';
import { Sidebar as SidebarIcon } from 'lucide-react';
import { mergeRefs } from '../../../lib/merge-refs';

const itemVariants = cva(
  'relative flex flex-row items-center gap-2 rounded-full w-fit h-8 px-3 py-2 text-start text-[#A3A3A3] font-normal leading-6 wrap-anywhere [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        link: 'transition-colors hover:text-fd-foreground data-[active=true]:bg-fd-background data-[active=true]:text-fd-foreground font-normal text-sm leading-6 data-[active=true]:hover:transition-colors',
        button: 'transition-colors hover:text-fd-foreground',
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
} from '../sidebar/base';

export function SidebarContent({
  ref: refProp,
  className,
  children,
  ...props
}: ComponentProps<'aside'>) {
  const ref = useRef<HTMLElement>(null);

  return (
    <Base.SidebarContent>
      {({ collapsed, hovered, ref: asideRef, ...rest }) => (
        <>
          <div
            data-sidebar-placeholder=""
            className="sticky top-(--fd-docs-row-1) z-20 [grid-area:sidebar] pointer-events-none *:pointer-events-auto h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] md:layout:[--fd-sidebar-width:268px] max-md:hidden"
          >
            {collapsed && <div className="absolute start-0 inset-y-0 w-4" {...rest} />}
            <aside
              id="nd-sidebar"
              ref={mergeRefs(ref, refProp, asideRef)}
              data-collapsed={collapsed}
              data-hovered={collapsed && hovered}
              className={cn(
                'absolute flex flex-col w-full start-0 inset-y-0 items-end bg-fd-card text-sm border-e duration-250 *:w-(--fd-sidebar-width)',
                collapsed && [
                  'inset-y-2 rounded-xl transition-transform border w-(--fd-sidebar-width)',
                  hovered
                    ? 'shadow-lg translate-x-2 rtl:-translate-x-2'
                    : '-translate-x-(--fd-sidebar-width) rtl:translate-x-full',
                ],
                ref.current &&
                  (ref.current.getAttribute('data-collapsed') === 'true') !== collapsed &&
                  'transition-[width,inset-block,translate,background-color]',
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
              'fixed flex top-[calc(--spacing(4)+var(--fd-docs-row-3))] start-4 shadow-lg transition-opacity rounded-xl p-0.5 border bg-fd-muted text-fd-muted-foreground z-10',
              (!collapsed || hovered) && 'pointer-events-none opacity-0',
            )}
          >
            <Base.SidebarCollapseTrigger
              className={cn(
                buttonVariants({
                  variant: 'ghost',
                  size: 'icon-sm',
                  className: 'rounded-lg',
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
      <Base.SidebarDrawerOverlay className="fixed z-40 inset-0 backdrop-blur-xs data-[state=open]:animate-fd-fade-in data-[state=closed]:animate-fd-fade-out" />
      <Base.SidebarDrawerContent
        className={cn(
          'fixed text-[0.9375rem] flex flex-col shadow-lg border-s end-0 inset-y-0 w-[85%] max-w-[380px] z-40 bg-fd-background data-[state=open]:animate-fd-sidebar-in data-[state=closed]:animate-fd-sidebar-out',
          className,
        )}
        {...props}
      >
        {children}
      </Base.SidebarDrawerContent>
    </>
  );
}

export function SidebarSeparator({ className, children, ...props }: ComponentProps<'p'>) {
  return (
    <Base.SidebarSeparator
      className={cn('text-xs leading-4 font-normal text-[#A3A3A3] px-0', className)}
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
      className={cn(itemVariants({ variant: 'link' }), className, "")}
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
      className={cn(itemVariants({ variant: collapsible ? 'button' : null }), 'w-full', className)}
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
      className={cn(itemVariants({ variant: 'link' }), 'w-full', className)}
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
    <Base.SidebarFolderContent
      className={className}
      {...props}
    >
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
