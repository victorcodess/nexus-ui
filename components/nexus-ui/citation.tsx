"use client";

import * as React from "react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

/** One source: `url` plus `title` / `description` from your pipeline. */
export type CitationSourceInput = {
  url: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
};

/** Normalized citation for primitives (context / item scope). */
export type ResolvedCitation = {
  url: string;
  title: React.ReactNode | null;
  description: React.ReactNode | null;
  siteName: string;
  faviconSrc: string;
};

export function parseCitationUrl(urlStr: string): URL {
  const trimmed = urlStr.trim();
  try {
    return new URL(trimmed);
  } catch {
    return new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  }
}

function titleCaseLabel(label: string): string {
  if (!label) return label;
  const lower = label.toLowerCase();
  return lower.slice(0, 1).toUpperCase() + lower.slice(1);
}

/**
 * Label before the last DNS segment for display, e.g. `en.wikipedia.org` → `Wikipedia`.
 * Not a full registrable-domain parse: `bbc.co.uk` → `Co` (wrong). Use a PSL library if you need that.
 */
export function rootDomainSiteName(url: URL): string {
  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  const segments = host.split(".").filter(Boolean);
  if (segments.length === 0) return "";

  const label =
    segments.length >= 2 ? segments[segments.length - 2]! : segments[0]!;

  return titleCaseLabel(label);
}

function hasCitationField(v: unknown): boolean {
  return (
    v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "")
  );
}

export function resolveCitationSource(
  input: CitationSourceInput,
): ResolvedCitation {
  const parsed = parseCitationUrl(input.url);
  const siteName = rootDomainSiteName(parsed);
  const faviconSrc = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(parsed.hostname)}&sz=64`;

  return {
    url: parsed.href,
    title: hasCitationField(input.title) ? input.title! : null,
    description: hasCitationField(input.description)
      ? input.description!
      : null,
    siteName,
    faviconSrc,
  };
}

export function resolveCitationSources(
  inputs: CitationSourceInput[],
): ResolvedCitation[] {
  return inputs.map(resolveCitationSource);
}

type CitationRootContextValue = {
  citation: ResolvedCitation;
};

const CitationRootContext =
  React.createContext<CitationRootContextValue | null>(null);

function useCitationRoot(component: string): CitationRootContextValue {
  const ctx = React.useContext(CitationRootContext);
  if (!ctx) {
    throw new Error(`${component} must be used within Citation`);
  }
  return ctx;
}

function useResolvedCitation(component: string): ResolvedCitation {
  const root = useCitationRoot(component);
  return root.citation;
}

export type CitationProps = Omit<
  React.ComponentProps<typeof HoverCard>,
  "children"
> & {
  citation: CitationSourceInput;
  children?: React.ReactNode;
};

function Citation({ citation, children, ...hoverCardProps }: CitationProps) {
  const resolved = React.useMemo(
    () => resolveCitationSource(citation),
    [citation],
  );

  const value = React.useMemo<CitationRootContextValue>(
    () => ({ citation: resolved }),
    [resolved],
  );

  return (
    <CitationRootContext.Provider value={value}>
      <HoverCard
        data-slot="citation"
        {...hoverCardProps}
        openDelay={50}
        closeDelay={50}
      >
        {children}
      </HoverCard>
    </CitationRootContext.Provider>
  );
}

export type CitationTriggerProps = React.ComponentProps<
  typeof HoverCardTrigger
> & {
  /** Full custom trigger; when set, `label`, `showFavicon`, and `showSiteName` are ignored. */
  children?: React.ReactNode;
  /** Replaces the default site name text; still respects `showFavicon` / `showSiteName`. */
  label?: React.ReactNode;
  showFavicon?: boolean;
  showSiteName?: boolean;
};

function CitationTrigger({
  className,
  children,
  label,
  showFavicon = true,
  showSiteName = true,
  ...props
}: CitationTriggerProps) {
  const root = useCitationRoot("CitationTrigger");
  const c = root.citation;

  if (children != null) {
    return (
      <HoverCardTrigger data-slot="citation-trigger" asChild {...props}>
        {children}
      </HoverCardTrigger>
    );
  }

  let text: React.ReactNode =
    label !== undefined && label !== null
      ? label
      : showSiteName
        ? c.siteName
        : null;
  let hasText =
    text !== null &&
    text !== undefined &&
    !(typeof text === "string" && text.trim() === "");

  if (!showFavicon && !hasText) {
    text = "Source";
    hasText = true;
  }

  return (
    <HoverCardTrigger data-slot="citation-trigger" asChild {...props}>
      <a
        href={c.url}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "inline-flex h-6 max-w-full cursor-default items-center rounded-full bg-secondary no-underline! opacity-100 transition-colors hover:bg-border data-[state=open]:opacity-100",
          hasText && showFavicon && "gap-1 py-1 pr-2 pl-1",
          hasText && !showFavicon && "px-2 py-1",
          !hasText && showFavicon && "p-1",
          className,
        )}
      >
        {showFavicon ? (
          <CitationFavicon variant="trigger" src={c.faviconSrc} />
        ) : null}
        {hasText ? <CitationSiteName>{text}</CitationSiteName> : null}
      </a>
    </HoverCardTrigger>
  );
}

export type CitationContentProps = React.ComponentProps<
  typeof HoverCardContent
>;

function CitationContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: CitationContentProps) {
  return (
    <HoverCardContent
      data-slot="citation-content"
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "flex w-66 flex-col overflow-hidden rounded-[12px] border-border p-0 shadow-modal dark:border-accent",
        className,
      )}
      {...props}
    />
  );
}

type CitationItemProps = React.ComponentPropsWithoutRef<"a">;

function CitationItem({
  className,
  children,
  href,
  ...props
}: CitationItemProps) {
  const c = useResolvedCitation("CitationItem");
  return (
    <a
      data-slot="citation-item"
      className={cn(
        "flex w-full flex-col gap-1 p-3 text-start no-underline outline-none",
        className,
      )}
      href={href ?? c.url}
      target="_blank"
      rel="noreferrer"
      {...props}
    >
      {children}
    </a>
  );
}

type CitationTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

function CitationTitle({ className, children, ...props }: CitationTitleProps) {
  const c = useResolvedCitation("CitationTitle");
  const content = children ?? c.title;
  if (content == null) return null;

  return (
    <h4
      data-slot="citation-title"
      className={cn(
        "line-clamp-2 text-xs leading-4 font-[450] text-primary",
        className,
      )}
      {...props}
    >
      {content}
    </h4>
  );
}

type CitationDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

function CitationDescription({
  className,
  children,
  ...props
}: CitationDescriptionProps) {
  const c = useResolvedCitation("CitationDescription");
  const content = children ?? c.description;
  if (content == null) return null;

  return (
    <p
      data-slot="citation-description"
      className={cn(
        "line-clamp-3 text-xs leading-4.5 font-[350] text-muted-foreground",
        className,
      )}
      {...props}
    >
      {content}
    </p>
  );
}

type CitationSourceProps = React.HTMLAttributes<HTMLDivElement>;

function CitationSource({
  className,
  children,
  ...props
}: CitationSourceProps) {
  return (
    <div
      data-slot="citation-source"
      className={cn("mt-2 flex items-center gap-1.5", className)}
      {...props}
    >
      {children ?? (
        <>
          <CitationFavicon variant="footer" />
          <CitationSiteName />
        </>
      )}
    </div>
  );
}

type CitationFaviconProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  variant?: "trigger" | "footer";
  src?: string;
};

function CitationFavicon({
  variant = "footer",
  className,
  src,
  ...props
}: CitationFaviconProps) {
  const c = useResolvedCitation("CitationFavicon");
  const resolvedSrc = src ?? c.faviconSrc;
  if (resolvedSrc === "") return null;

  return (
    <div
      className={cn(
        "flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background",
        variant === "footer" && "border border-border dark:border-accent",
        className,
      )}
      {...props}
    >
      <img src={resolvedSrc} alt="" className="size-full object-cover" />
    </div>
  );
}

function CitationSiteName({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  const c = useResolvedCitation("CitationSiteName");
  const content = children ?? c.siteName;
  if (content == null) return null;

  return (
    <span
      data-slot="citation-site-name"
      className={cn(
        "truncate text-xs leading-4.5 font-normal text-primary",
        className,
      )}
      {...props}
    >
      {content}
    </span>
  );
}

export {
  Citation,
  CitationContent,
  CitationDescription,
  CitationFavicon,
  CitationItem,
  CitationSiteName,
  CitationSource,
  CitationTitle,
  CitationTrigger,
};
