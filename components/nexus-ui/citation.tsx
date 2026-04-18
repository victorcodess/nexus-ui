"use client";

import * as React from "react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
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
  citations: ResolvedCitation[];
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  carouselApi: CarouselApi | null;
  setCarouselApi: (api: CarouselApi | undefined) => void;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  carouselCurrent: number;
  carouselCount: number;
};

const CitationRootContext =
  React.createContext<CitationRootContextValue | null>(null);

const CitationItemContext = React.createContext<ResolvedCitation | null>(null);

function useCitationRoot(component: string): CitationRootContextValue {
  const ctx = React.useContext(CitationRootContext);
  if (!ctx) {
    throw new Error(`${component} must be used within Citation`);
  }
  return ctx;
}

function useResolvedCitation(component: string): ResolvedCitation {
  const item = React.useContext(CitationItemContext);
  const root = useCitationRoot(component);
  const idx = Math.min(
    Math.max(0, root.activeIndex),
    Math.max(0, root.citations.length - 1),
  );
  const fromRoot = root.citations[idx];
  const resolved = item ?? fromRoot;
  if (!resolved) {
    throw new Error(`${component}: no citation for this scope`);
  }
  return resolved;
}

export type CitationProps = Omit<
  React.ComponentProps<typeof HoverCard>,
  "children"
> & {
  citations: CitationSourceInput[];
  children?: React.ReactNode;
};

function Citation({
  citations: citationInputs,
  children,
  ...hoverCardProps
}: CitationProps) {
  const resolved = React.useMemo(
    () => resolveCitationSources(citationInputs),
    [citationInputs],
  );

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi | null>(
    null,
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [carouselCurrent, setCarouselCurrent] = React.useState(1);
  const [carouselCount, setCarouselCount] = React.useState(0);

  const len = resolved.length;

  React.useEffect(() => {
    setActiveIndex((i) => (len === 0 ? 0 : Math.min(Math.max(0, i), len - 1)));
  }, [len]);

  React.useEffect(() => {
    if (!carouselApi) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      setCarouselCount(0);
      setCarouselCurrent(1);
      return;
    }
    const sync = () => {
      setActiveIndex(carouselApi.selectedScrollSnap());
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
      setCarouselCount(carouselApi.scrollSnapList().length);
      setCarouselCurrent(carouselApi.selectedScrollSnap() + 1);
    };
    sync();
    carouselApi.on("select", sync);
    carouselApi.on("reInit", sync);
    return () => {
      carouselApi.off("select", sync);
      carouselApi.off("reInit", sync);
    };
  }, [carouselApi]);

  const setCarouselApiCb = React.useCallback((api: CarouselApi | undefined) => {
    setCarouselApi(api ?? null);
  }, []);

  const scrollPrev = React.useCallback(() => {
    carouselApi?.scrollPrev();
  }, [carouselApi]);

  const scrollNext = React.useCallback(() => {
    carouselApi?.scrollNext();
  }, [carouselApi]);

  const value = React.useMemo<CitationRootContextValue>(
    () => ({
      citations: resolved,
      activeIndex,
      setActiveIndex,
      carouselApi,
      setCarouselApi: setCarouselApiCb,
      scrollPrev,
      scrollNext,
      canScrollPrev,
      canScrollNext,
      carouselCurrent,
      carouselCount,
    }),
    [
      resolved,
      activeIndex,
      carouselApi,
      setCarouselApiCb,
      scrollPrev,
      scrollNext,
      canScrollPrev,
      canScrollNext,
      carouselCurrent,
      carouselCount,
    ],
  );

  if (len === 0) {
    return null;
  }

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
  const c = root.citations[0]!;

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
          "inline-flex h-6 max-w-full cursor-default items-center rounded-full bg-secondary no-underline! opacity-100 transition-colors hover:bg-border data-[state=open]:opacity-100 align-middle",
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
        {root.citations.length > 1 && (
          <span data-slot="citation-extra-count" className="text-xs leading-4.5 font-[350] text-muted-foreground tabular-nums">
            +{root.citations.length - 1}
          </span>
        )}
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

type CitationCarouselProps = React.ComponentProps<typeof Carousel>;

function CitationCarousel({
  setApi: setApiProp,
  ...props
}: CitationCarouselProps) {
  const { setCarouselApi } = useCitationRoot("CitationCarousel");
  return (
    <Carousel
      data-slot="citation-carousel"
      setApi={(api) => {
        setCarouselApi(api);
        setApiProp?.(api);
      }}
      {...props}
    />
  );
}

type CitationCarouselHeaderProps = React.ComponentProps<"div">;

function CitationCarouselHeader({
  className,
  ...props
}: CitationCarouselHeaderProps) {
  return (
    <div
      data-slot="citation-carousel-header"
      className={cn(
        "flex h-auto w-full items-center justify-between px-3 pt-3",
        className,
      )}
      {...props}
    />
  );
}

/** Horizontal flex track height = max(slides); shrink viewport to the active slide. */
function useCarouselViewportHeight(
  wrapRef: React.RefObject<HTMLDivElement | null>,
  carouselApi: CarouselApi | null,
  activeIndex: number,
) {
  React.useLayoutEffect(() => {
    const vp = wrapRef.current?.querySelector<HTMLElement>(
      "[data-slot=carousel-content]",
    );
    if (!vp) return;
    const clear = () => {
      vp.style.height = "";
      vp.style.transition = "";
    };
    if (!carouselApi) return clear();
    vp.style.transition = "height 500ms ease-out";
    const sync = () => {
      const h = carouselApi.slideNodes()[activeIndex]?.offsetHeight ?? 0;
      vp.style.height = h > 0 ? `${h}px` : "";
    };
    sync();
    const slide = carouselApi.slideNodes()[activeIndex];
    if (!slide) return clear;
    const ro = new ResizeObserver(sync);
    ro.observe(slide);
    return () => (ro.disconnect(), clear());
  }, [carouselApi, activeIndex]);
}

type CitationCarouselContentProps = React.ComponentProps<
  typeof CarouselContent
>;

function CitationCarouselContent({
  className,
  ...props
}: CitationCarouselContentProps) {
  const { carouselApi, activeIndex } = useCitationRoot(
    "CitationCarouselContent",
  );
  const wrapRef = React.useRef<HTMLDivElement>(null);
  useCarouselViewportHeight(wrapRef, carouselApi, activeIndex);

  return (
    <div ref={wrapRef} className="contents">
      <CarouselContent
        data-slot="citation-carousel-content"
        className={className}
        {...props}
      />
    </div>
  );
}

type CitationCarouselItemProps = React.ComponentProps<typeof CarouselItem> & {
  index: number;
};

function CitationCarouselItem({
  index,
  className,
  children,
  ...props
}: CitationCarouselItemProps) {
  const { citations } = useCitationRoot("CitationCarouselItem");
  const item = citations[index];
  if (!item) return null;

  return (
    <CarouselItem
      data-slot="citation-carousel-item"
      className={cn("self-start", className)}
      {...props}
    >
      <CitationItemContext.Provider value={item}>
        {children}
      </CitationItemContext.Provider>
    </CarouselItem>
  );
}

type CitationCarouselPaginationProps = React.ComponentProps<"div">;

function CitationCarouselPagination({
  className,
  ...props
}: CitationCarouselPaginationProps) {
  return (
    <div
      data-slot="citation-carousel-pagination"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

type CitationCarouselNavButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement>;

function CitationCarouselPrev({
  className,
  children,
  ...props
}: CitationCarouselNavButtonProps) {
  const { scrollPrev, canScrollPrev } = useCitationRoot("CitationCarouselPrev");
  return (
    <button
      type="button"
      data-slot="citation-carousel-prev"
      disabled={!canScrollPrev}
      className={cn(
        "flex size-6.5 cursor-pointer items-center justify-center rounded-full text-primary outline-0 transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-accent/50",
        className,
      )}
      onClick={scrollPrev}
      {...props}
    >
      {children ?? (
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          strokeWidth={2}
          className="size-4"
        />
      )}
    </button>
  );
}

function CitationCarouselNext({
  className,
  children,
  ...props
}: CitationCarouselNavButtonProps) {
  const { scrollNext, canScrollNext } = useCitationRoot("CitationCarouselNext");
  return (
    <button
      type="button"
      data-slot="citation-carousel-next"
      disabled={!canScrollNext}
      className={cn(
        "flex size-6.5 cursor-pointer items-center justify-center rounded-full text-primary outline-0 transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-accent/50",
        className,
      )}
      onClick={scrollNext}
      {...props}
    >
      {children ?? (
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          strokeWidth={2}
          className="size-4"
        />
      )}
    </button>
  );
}

type CitationCarouselIndexProps = React.HTMLAttributes<HTMLSpanElement>;

function CitationCarouselIndex({
  className,
  ...props
}: CitationCarouselIndexProps) {
  const { carouselCurrent, carouselCount } = useCitationRoot(
    "CitationCarouselIndex",
  );

  return (
    <span
      data-slot="citation-carousel-index"
      className={cn(
        "text-xs leading-4.5 font-[350] text-muted-foreground tabular-nums",
        className,
      )}
      {...props}
    >
      {carouselCurrent}/{carouselCount}
    </span>
  );
}

type CitationFaviconGroupProps = React.ComponentProps<"div">;

function CitationFaviconGroup({
  className,
  children,
  ...props
}: CitationFaviconGroupProps) {
  const { citations } = useCitationRoot("CitationFaviconGroup");
  return (
    <div
      data-slot="citation-favicon-group"
      className={cn(
        "flex -space-x-2 *:data-[slot=citation-favicon]:ring-2 *:data-[slot=citation-favicon]:ring-secondary",
        className,
      )}
      {...props}
    >
      {children ??
        citations.map((citation, i) => (
          <CitationFavicon
            key={citation.url + i}
            variant="trigger"
            src={citation.faviconSrc}
          />
        ))}
    </div>
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
      data-slot="citation-favicon"
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
  CitationCarousel,
  CitationCarouselContent,
  CitationCarouselHeader,
  CitationCarouselIndex,
  CitationCarouselItem,
  CitationCarouselNext,
  CitationCarouselPagination,
  CitationCarouselPrev,
  CitationContent,
  CitationDescription,
  CitationFavicon,
  CitationFaviconGroup,
  CitationItem,
  CitationSiteName,
  CitationSource,
  CitationTitle,
  CitationTrigger,
};
