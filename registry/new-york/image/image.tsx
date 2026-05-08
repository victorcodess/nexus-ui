"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Slot } from "@radix-ui/react-slot";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

type ImageData = {
  src?: string;
  base64?: string;
  uint8Array?: Uint8Array;
  mediaType?: string;
};

function resolveBase64MediaType(base64: string, fallback: string) {
  const trimmed = base64.trim();

  if (trimmed.startsWith("data:")) {
    return /^data:([^;,]+)/i.exec(trimmed)?.[1] ?? fallback;
  }

  const normalized = trimmed.replace(/\s+/g, "").slice(0, 120);

  if (normalized.startsWith("iVBORw0KGgo")) return "image/png";
  if (normalized.startsWith("/9j/")) return "image/jpeg";
  if (normalized.startsWith("R0lGOD")) return "image/gif";
  if (normalized.startsWith("UklGR") && normalized.includes("V0VCUA")) {
    return "image/webp";
  }
  if (normalized.startsWith("PHN2Zy") || normalized.startsWith("PD94bWwg")) {
    return "image/svg+xml";
  }

  return fallback;
}

function toDataUrl(base64: string, mediaType: string) {
  const trimmed = base64.trim();
  if (trimmed.startsWith("data:")) return trimmed;
  return `data:${mediaType};base64,${trimmed}`;
}

type ImageContextValue = {
  src?: string;
  alt: string;
  mediaType?: string;
  hasError: boolean;
  setHasError: (value: boolean) => void;
};

const ImageContext = React.createContext<ImageContextValue | null>(null);

function useImageContext(component: string) {
  const ctx = React.useContext(ImageContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Image>`);
  }
  return ctx;
}

export type ImageProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  Omit<React.ComponentProps<typeof DialogPrimitive.Root>, "children"> &
  ImageData & {
    alt?: string;
    children?: React.ReactNode;
  };

function Image({
  src,
  base64,
  uint8Array,
  mediaType,
  open,
  defaultOpen,
  onOpenChange,
  modal,
  alt = "",
  className,
  children,
  ...props
}: ImageProps) {
  const [blobSrc, setBlobSrc] = React.useState<string>();
  const { resolvedMediaType, resolvedSrc } = React.useMemo(() => {
    const nextResolvedMediaType = base64
      ? resolveBase64MediaType(base64, mediaType ?? "image/png")
      : (mediaType ?? "image/png");

    const nextResolvedSrc = base64
      ? toDataUrl(base64, nextResolvedMediaType)
      : (blobSrc ?? src);

    return {
      resolvedMediaType: nextResolvedMediaType,
      resolvedSrc: nextResolvedSrc,
    };
  }, [base64, mediaType, blobSrc, src]);

  React.useEffect(() => {
    if (base64 || uint8Array == null || uint8Array.length === 0) {
      setBlobSrc(undefined);
      return;
    }

    const blob = new Blob([Uint8Array.from(uint8Array).buffer], {
      type: mediaType ?? "image/png",
    });
    const objectUrl = URL.createObjectURL(blob);
    setBlobSrc(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [base64, uint8Array, mediaType]);

  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [resolvedSrc]);

  const contextValue = React.useMemo<ImageContextValue>(
    () => ({
      src: resolvedSrc,
      alt,
      mediaType: resolvedMediaType,
      hasError,
      setHasError,
    }),
    [resolvedSrc, alt, resolvedMediaType, hasError],
  );

  return (
    <ImageContext.Provider value={contextValue}>
      <DialogPrimitive.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        modal={modal}
      >
        <div
          data-slot="image"
          className={cn(
            "group/image relative inline-flex aspect-auto max-w-full min-w-64 flex-col overflow-hidden rounded-[20px] border dark:border-muted",
            className,
          )}
          {...props}
        >
          {children ?? <ImagePreview />}
        </div>
      </DialogPrimitive.Root>
    </ImageContext.Provider>
  );
}

export type ImagePreviewProps = React.ImgHTMLAttributes<HTMLImageElement>;

function ImagePreview({
  className,
  src: srcProp,
  alt: altProp,
  onLoad,
  onError,
  ...props
}: ImagePreviewProps) {
  const { src: contextSrc, alt, setHasError } = useImageContext("ImagePreview");
  const resolvedSrc = srcProp ?? contextSrc;

  React.useEffect(() => {
    setHasError(false);
  }, [resolvedSrc, setHasError]);

  if (!resolvedSrc) {
    return <ImageLoader aria-hidden className={className} />;
  }

  return (
    <DialogPrimitive.Trigger data-slot="image-preview-trigger" asChild>
      <div data-slot="image-preview" className="relative size-full max-w-full">
        <ImageLoader className="absolute inset-0 z-0" />
        <img
          {...props}
          src={resolvedSrc}
          alt={altProp ?? alt}
          className={cn(
            "relative z-1 size-full max-w-full overflow-hidden rounded-md object-cover",
            className,
          )}
          onLoad={(e) => {
            setHasError(false);
            onLoad?.(e);
          }}
          onError={(e) => {
            setHasError(true);
            onError?.(e);
          }}
        />
      </div>
    </DialogPrimitive.Trigger>
  );
}

export type ImageLightboxProps = React.ComponentProps<
  typeof DialogPrimitive.Portal
>;

function ImageLightbox(props: ImageLightboxProps) {
  return <DialogPrimitive.Portal data-slot="image-lightbox" {...props} />;
}

export type ImageLightboxOverlayProps = React.ComponentProps<
  typeof DialogPrimitive.Overlay
>;

function ImageLightboxOverlay({
  className,
  ...props
}: ImageLightboxOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      data-slot="image-lightbox-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-background/50 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

export type ImageLightboxPreviewProps = React.ComponentProps<
  typeof DialogPrimitive.Content
> & {
  src?: string;
  alt?: string;
};

function ImageLightboxPreview({
  className,
  children,
  onInteractOutside,
  ...props
}: ImageLightboxPreviewProps) {
  const { src: contextSrc, alt } = useImageContext("ImageLightboxPreview");
  const resolvedSrc = contextSrc;
  return (
    <DialogPrimitive.Content
      data-slot="image-lightbox-preview"
      className={cn(
        "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg xl:max-w-2xl",
        className,
      )}
      onInteractOutside={(e) => {
        const target = e.target as HTMLElement | null;
        if (target?.closest('[data-slot="image-actions"]')) {
          e.preventDefault();
        }
        onInteractOutside?.(e);
      }}
      {...props}
    >
      <img
        data-slot="image-lightbox-image"
        src={resolvedSrc}
        alt={alt}
        className={cn("size-full object-contain")}
      />
      {children}
      <ImageLightboxTitle>{alt || "Image"}</ImageLightboxTitle>
    </DialogPrimitive.Content>
  );
}

export type ImageLightboxCloseProps = React.ComponentProps<
  typeof DialogPrimitive.Close
>;

function ImageLightboxClose(props: ImageLightboxCloseProps) {
  return (
    <DialogPrimitive.Close
      data-slot="image-lightbox-close"
      className="sr-only"
      {...props}
    />
  );
}

function ImageLightboxTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="image-lightbox-title"
      className={cn("sr-only", className)}
      {...props}
    />
  );
}

export type ImageLoaderProps = React.HTMLAttributes<HTMLDivElement>;

function ImageLoader({ className, ...props }: ImageLoaderProps) {
  const { hasError } = useImageContext("ImageLoader");

  return (
    <div
      data-slot="image-loader"
      className={cn(
        "size-full animate-pulse rounded-lg bg-input",
        hasError && "bg-destructive/20",
        className,
      )}
      {...props}
    />
  );
}

export type ImageActionsAlign =
  | "inline-start"
  | "inline-end"
  | "block-start"
  | "block-end";

const imageActionsAlignStyles: Record<ImageActionsAlign, string> = {
  "inline-start": "top-1/2 left-0 -translate-y-1/2 flex-col h-full",
  "inline-end": "top-1/2 right-0 -translate-y-1/2 flex-col h-full",
  "block-start": "top-0 left-1/2 -translate-x-1/2 w-full",
  "block-end": "bottom-0 left-1/2 -translate-x-1/2 w-full",
};

export type ImageActionsProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: ImageActionsAlign;
};

function ImageActions({
  align = "block-end",
  className,
  ...props
}: ImageActionsProps) {
  return (
    <div
      data-slot="image-actions"
      className={cn(
        "pointer-events-none absolute z-10 flex shrink-0 items-center justify-between px-3 py-3",
        imageActionsAlignStyles[align],
        className,
      )}
      {...props}
    />
  );
}

type ImageActionGroupProps = React.HTMLAttributes<HTMLDivElement>;

function ImageActionGroup({ className, ...props }: ImageActionGroupProps) {
  return (
    <div
      data-slot="image-action-group"
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

export type ImageActionProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  tooltip?:
    | string
    | {
        content?: string;
        side?: "top" | "right" | "bottom" | "left";
        shortcut?: string;
      };
};

function ImageAction({
  asChild = false,
  tooltip,
  className,
  ...props
}: ImageActionProps) {
  const Comp = asChild ? Slot : "div";
  const { content, side, shortcut } =
    typeof tooltip === "string" ? { content: tooltip } : tooltip ?? {};

  if (!content) {
    return (
      <Comp
        data-slot="image-action"
        className={cn("pointer-events-auto", className)}
        {...props}
      />
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Comp
            data-slot="image-action"
            className={cn("pointer-events-auto", className)}
            {...props}
          />
        </TooltipTrigger>
        <TooltipContent className="rounded-full" side={side}>
          {content}
          {shortcut ? <Kbd className="rounded-md!">{shortcut}</Kbd> : null}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

Image.displayName = "Image";
ImagePreview.displayName = "ImagePreview";
ImageLightbox.displayName = "ImageLightbox";
ImageLightboxOverlay.displayName = "ImageLightboxOverlay";
ImageLightboxPreview.displayName = "ImageLightboxPreview";
ImageLightboxClose.displayName = "ImageLightboxClose";
ImageLoader.displayName = "ImageLoader";
ImageActions.displayName = "ImageActions";
ImageActionGroup.displayName = "ImageActionGroup";
ImageAction.displayName = "ImageAction";

export {
  Image,
  ImagePreview,
  ImageLightbox,
  ImageLightboxOverlay,
  ImageLightboxPreview,
  ImageLightboxClose,
  ImageLoader,
  ImageActions,
  ImageActionGroup,
  ImageAction,
};
