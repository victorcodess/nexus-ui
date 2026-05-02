'use client';

import type * as PageTree from 'fumadocs-core/page-tree';
import {
  Fragment,
  type ComponentProps,
  type HTMLAttributes,
  type ReactNode,
  useMemo,
} from 'react';
import { LanguageCircleIcon, PanelRightIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from '../../../lib/cn';
import { buttonVariants } from '../../ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarDrawer,
  SidebarLinkItem,
  SidebarPageTree,
  SidebarTrigger,
  SidebarViewport,
} from './sidebar';
import { type BaseLayoutProps, renderTitleNav, useLinkItems } from '../shared';
import { LinkItem } from '../link-item';
import { LanguageToggle, LanguageToggleText } from '../language-toggle';
import { LayoutBody, LayoutContextProvider, LayoutHeader, LayoutTabs } from './client';
import { TreeContextProvider } from 'fumadocs-ui/contexts/tree';
import { ThemeToggle } from '../theme-toggle';
import { LargeSearchToggle, SearchToggle } from '../search-toggle';
import { getSidebarTabs, type GetSidebarTabsOptions } from '../sidebar/tabs';
import type { SidebarPageTreeComponents } from '../sidebar/page-tree';
import { SidebarTabsDropdown, type SidebarTabWithProps } from '../sidebar/tabs/dropdown';

export interface DocsLayoutProps extends BaseLayoutProps {
  tree: PageTree.Root;

  sidebar?: SidebarOptions;

  tabMode?: 'top' | 'auto';

  /**
   * Props for the `div` container
   */
  containerProps?: HTMLAttributes<HTMLDivElement>;
}

interface SidebarOptions
  extends
    ComponentProps<'aside'>,
    Pick<ComponentProps<typeof Sidebar>, 'defaultOpenLevel' | 'prefetch'> {
  enabled?: boolean;
  component?: ReactNode;
  components?: Partial<SidebarPageTreeComponents>;

  /**
   * Root Toggle options
   */
  tabs?: SidebarTabWithProps[] | GetSidebarTabsOptions | false;

  banner?: ReactNode;
  footer?: ReactNode;

  /**
   * Support collapsing the sidebar on desktop mode
   *
   * @defaultValue true
   */
  collapsible?: boolean;
}

export function DocsLayout({
  nav: { transparentMode, ...nav } = {},
  sidebar: {
    tabs: sidebarTabs,
    enabled: sidebarEnabled = true,
    defaultOpenLevel,
    prefetch,
    ...sidebarProps
  } = {},
  searchToggle = {},
  themeSwitch = {},
  tabMode = 'auto',
  i18n = false,
  children,
  tree,
  ...props
}: DocsLayoutProps) {
  const tabs = useMemo(() => {
    if (Array.isArray(sidebarTabs)) {
      return sidebarTabs;
    }
    if (typeof sidebarTabs === 'object') {
      return getSidebarTabs(tree, sidebarTabs);
    }
    if (sidebarTabs !== false) {
      return getSidebarTabs(tree);
    }
    return [];
  }, [tree, sidebarTabs]);
  const { menuItems } = useLinkItems(props);

  function sidebar() {
    const { footer, banner, collapsible = true, component, components, ...rest } = sidebarProps;
    if (component) return component;

    const iconLinks = menuItems.filter((item) => item.type === 'icon');
    const viewport = (
      <SidebarViewport>
        {menuItems
          .filter((v) => v.type !== 'icon')
          .map((item, i, list) => (
            <SidebarLinkItem key={i} item={item} className={cn(i === list.length - 1 && 'mb-4')} />
          ))}
        <SidebarPageTree {...components} />
      </SidebarViewport>
    );

    return (
      <>
        <SidebarContent {...rest} className='bg-transparent border-none max-w-fit pr-0 pl-5'>
          {viewport}
        </SidebarContent>
        <SidebarDrawer>
          <div className="flex flex-col gap-3 p-4 pb-2">
            <div className="flex text-fd-muted-foreground items-center gap-1.5">
              <div className="flex flex-1">
                {iconLinks.map((item, i) => (
                  <LinkItem
                    key={i}
                    item={item}
                    className={cn(
                      buttonVariants({
                        size: 'icon-sm',
                        variant: 'ghost',
                        className: 'p-2',
                      }),
                    )}
                    aria-label={item.label}
                  >
                    {item.icon}
                  </LinkItem>
                ))}
              </div>
              {i18n && (
                <LanguageToggle>
                  <HugeiconsIcon icon={LanguageCircleIcon} strokeWidth={2.5} className="size-4.5" />
                  <LanguageToggleText />
                </LanguageToggle>
              )}
              {themeSwitch.enabled !== false &&
                (themeSwitch.component ?? <ThemeToggle className="p-0" mode={themeSwitch.mode} />)}
              <SidebarTrigger
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                    size: 'icon-sm',
                    className: 'p-2',
                  }),
                )}
              >
                <HugeiconsIcon icon={PanelRightIcon} strokeWidth={2.5} className="size-4.5" />
              </SidebarTrigger>
            </div>
            {tabs.length > 0 && <SidebarTabsDropdown options={tabs} />}
            {banner}
          </div>
          {viewport}
          <div className="flex flex-col border-t p-4 pt-2 empty:hidden">{footer}</div>
        </SidebarDrawer>
      </>
    );
  }

  return (
    <TreeContextProvider tree={tree}>
      <LayoutContextProvider navTransparentMode={transparentMode}>
        <Sidebar defaultOpenLevel={defaultOpenLevel} prefetch={prefetch}>
          <LayoutBody {...props.containerProps}>
            {nav.enabled !== false ? (
              <Fragment key="nd-header">
                {nav.component ?? (
                  <LayoutHeader
                    id="nd-subnav"
                    className="[grid-area:header] sticky top-(--fd-docs-row-1) z-30 flex items-center ps-4 pe-2.5 border-b transition-colors backdrop-blur-sm h-(--fd-header-height) md:hidden max-md:layout:[--fd-header-height:--spacing(14)] data-[transparent=false]:bg-fd-background/80"
                  >
                    {renderTitleNav(nav, {
                      className: 'inline-flex items-center gap-2.5 font-semibold',
                    })}
                    <div className="flex-1">{nav.children}</div>
                    {searchToggle.enabled !== false &&
                      (searchToggle.components?.sm ?? (
                        <SearchToggle className="p-2" hideIfDisabled />
                      ))}
                    {sidebarEnabled && (
                      <SidebarTrigger
                        className={cn(
                          buttonVariants({
                            variant: 'ghost',
                            size: 'icon-sm',
                            className: 'p-2',
                          }),
                        )}
                      >
                        <HugeiconsIcon icon={PanelRightIcon} strokeWidth={2.5} className="size-4.5" />
                      </SidebarTrigger>
                    )}
                  </LayoutHeader>
                )}
              </Fragment>
            ) : null}
            {sidebarEnabled ? <Fragment key="nd-sidebar">{sidebar()}</Fragment> : null}
            {tabMode === 'top' && tabs.length > 0 ? (
              <LayoutTabs
                key="nd-tabs"
                options={tabs}
                className="z-10 bg-fd-background border-b px-6 pt-3 xl:px-8 max-md:hidden"
              />
            ) : null}
            <Fragment key="nd-main">{children}</Fragment>
          </LayoutBody>
        </Sidebar>
      </LayoutContextProvider>
    </TreeContextProvider>
  );
}
