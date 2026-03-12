import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../../../lib/cn";
import { FileText, Sparkles, SquarePen, Text } from "lucide-react";
import { ViewOptions } from "../../../ai/page-actions";
import { Prose } from "../../../ui/prose";
import {
  type BreadcrumbProps,
  type FooterProps,
  CopyPageMarkdown,
  PageBreadcrumb,
  PageFooter,
  PageTOCPopover,
  PageTOCPopoverContent,
  PageTOCPopoverTrigger,
} from "./client";
import type { AnchorProviderProps, TOCItemType } from "fumadocs-core/toc";
import * as TocDefault from "../../../toc/default";
import * as TocClerk from "../../../toc/clerk";
import { TOCProvider, TOCScrollArea } from "../../../toc";
import Link from "next/link";
import { gitConfig } from "@/lib/layout.shared";

interface BreadcrumbOptions extends BreadcrumbProps {
  enabled: boolean;
  component: ReactNode;
}

interface FooterOptions extends FooterProps {
  enabled: boolean;
  component: ReactNode;
}

export interface DocsPageProps {
  toc?: TOCItemType[];
  tableOfContent?: Partial<TableOfContentOptions>;
  tableOfContentPopover?: Partial<TableOfContentPopoverOptions>;

  /**
   * Extend the page to fill all available space
   *
   * @defaultValue false
   */
  full?: boolean;

  /**
   * Replace or disable breadcrumb
   */
  breadcrumb?: Partial<BreadcrumbOptions>;

  /**
   * Footer navigation, located under the page body.
   *
   * You can specify `footer.children` to add extra components under the footer.
   */
  footer?: Partial<FooterOptions>;

  children?: ReactNode;

  /**
   * GitHub edit URL for the current page.
   */
  editUrl?: string;

  /**
   * URL to the raw markdown content of the current page.
   */
  markdownUrl?: string;

  /**
   * Apply class names to the `#nd-page` container.
   */
  className?: string;
}

type TableOfContentOptions = Pick<AnchorProviderProps, "single"> & {
  /**
   * Custom content in TOC container, before the main TOC
   */
  header?: ReactNode;

  /**
   * Custom content in TOC container, after the main TOC
   */
  footer?: ReactNode;

  enabled: boolean;
  component: ReactNode;

  /**
   * @defaultValue 'normal'
   */
  style?: "normal" | "clerk";
};

type TableOfContentPopoverOptions = Omit<TableOfContentOptions, "single">;

export function DocsPage({
  breadcrumb: {
    enabled: breadcrumbEnabled = true,
    component: breadcrumb,
    ...breadcrumbProps
  } = {},
  footer: {
    enabled: footerEnabled,
    component: footerReplace,
    ...footerProps
  } = {},
  full = false,
  tableOfContentPopover: {
    enabled: tocPopoverEnabled,
    component: tocPopover,
    ...tocPopoverOptions
  } = {},
  tableOfContent: {
    enabled: tocEnabled,
    component: tocReplace,
    ...tocOptions
  } = {},
  toc = [],
  children,
  editUrl,
  markdownUrl,
  className,
}: DocsPageProps) {
  // disable TOC on full mode, you can still enable it with `enabled` option.
  tocEnabled ??=
    !full &&
    (toc.length > 0 ||
      tocOptions.footer !== undefined ||
      tocOptions.header !== undefined);

  tocPopoverEnabled ??=
    toc.length > 0 ||
    tocPopoverOptions.header !== undefined ||
    tocPopoverOptions.footer !== undefined;

  let wrapper = (children: ReactNode) => children;

  if (tocEnabled || tocPopoverEnabled) {
    wrapper = (children) => (
      <TOCProvider single={tocOptions.single} toc={toc}>
        {children}
      </TOCProvider>
    );
  }

  return wrapper(
    <>
      {tocPopoverEnabled &&
        (tocPopover ?? (
          <PageTOCPopover>
            <PageTOCPopoverTrigger />
            <PageTOCPopoverContent>
              {tocPopoverOptions.header}
              <TOCScrollArea>
                {tocPopoverOptions.style === "clerk" ? (
                  <TocClerk.TOCItems />
                ) : (
                  <TocDefault.TOCItems />
                )}
              </TOCScrollArea>
              {tocPopoverOptions.footer}
            </PageTOCPopoverContent>
          </PageTOCPopover>
        ))}
      <article
        id="nd-page"
        data-full={full}
        className={cn(
          "mx-auto flex w-full max-w-[750px] flex-col gap-4 px-4 py-6 [grid-area:main] md:px-6 md:pt-8 xl:px-8 xl:pt-10",
          full ? "max-w-[1168px]" : "xl:layout:[--fd-toc-width:222px]",
          className,
        )}
      >
        {breadcrumbEnabled &&
          (breadcrumb ?? <PageBreadcrumb {...breadcrumbProps} />)}
        {children}
        {footerEnabled !== false &&
          (footerReplace ?? <PageFooter {...footerProps} />)}
      </article>
      {tocEnabled &&
        (tocReplace ?? (
          <div
            id="nd-toc"
            className="sticky top-(--fd-docs-row-1) ms-auto flex h-(--fd-docs-height) w-(--fd-toc-width) flex-col gap-5 pe-5 pt-5 pb-2 [grid-area:toc] max-xl:hidden"
          >
            {tocOptions.header}
            <div className="flex flex-col">
              <h3
                id="toc-title"
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500"
              >
                <Text className="size-4" />
                <span className="text-xs leading-4">
                  On this page
                </span>
              </h3>
              <TOCScrollArea>
                {tocOptions.style === "clerk" ? (
                  <TocClerk.TOCItems />
                ) : (
                  <TocDefault.TOCItems />
                )}
              </TOCScrollArea>
            </div>

            <div className="mx-auto h-px w-[calc(100%-40px)] bg-gray-100 dark:bg-gray-800"></div>

            <div className="flex flex-col gap-3 pl-5 transition-colors duration-200 pt-2">
              {markdownUrl && <CopyPageMarkdown markdownUrl={markdownUrl} />}
              {markdownUrl && (
                <Link
                  href={markdownUrl.replace(/^\/llms\.mdx\/docs\//, "/docs/") + ".md"}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex h-4 w-full cursor-pointer items-center justify-start gap-1 bg-transparent px-0! text-[13px] leading-5 font-normal text-gray-400 dark:text-gray-500 hover:bg-transparent hover:text-gray-600 dark:hover:text-gray-300"
                >
                  View as markdown <FileText className="size-3 font-normal" />
                </Link>
              )}
              <Link
                href={editUrl ?? "#"}
                target="_blank"
                rel="noreferrer noopener"
                className="flex h-4 w-full cursor-pointer items-center justify-start gap-1 bg-transparent px-0! text-[13px] leading-5 font-normal text-gray-400 dark:text-gray-500 hover:bg-transparent hover:text-gray-600 dark:hover:text-gray-300"
              >
                Edit on GitHub <SquarePen className="size-3 font-normal" />
              </Link>
              {markdownUrl && (
                <ViewOptions
                  markdownUrl={markdownUrl}
                  githubUrl={editUrl ?? "#"}
                  trigger={
                    <span className="flex h-4 w-full items-center gap-1 text-[13px] leading-5 font-normal">
                      Ask AI <Sparkles className="size-3 font-normal" />
                    </span>
                  }
                />
              )}
            </div>
          </div>
        ))}
    </>,
  );
}

/**
 * Add typography styles
 */
export function DocsBody({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <Prose className={cn("flex-1", className)} {...props}>
      {children}
    </Prose>
  );
}

export function DocsDescription({
  children,
  className,
  ...props
}: ComponentProps<"p">) {
  // Don't render if no description provided
  if (children === undefined) return null;

  return (
    <p
      {...props}
      className={cn("mb-8 text-base text-gray-400 dark:text-gray-500", className)}
    >
      {children}
    </p>
  );
}

export function DocsTitle({
  children,
  className,
  ...props
}: ComponentProps<"h1">) {
  return (
    <h1
      {...props}
      className={cn(
        "text-xl leading-5.5 font-medium tracking-[-0.5px] text-gray-900 dark:text-gray-50",
        className,
      )}
    >
      {children}
    </h1>
  );
}

export { PageLastUpdate, PageBreadcrumb } from "./client";
