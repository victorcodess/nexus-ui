"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type ImageData = {
  base64?: string;
  uint8Array?: Uint8Array;
  mediaType?: string;
};

function resolveBase64MediaType(base64: string, fallback: string) {
  const normalized = base64.replace(/\s+/g, "").slice(0, 120);

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
  ImageData & {
    alt?: string;
    children?: React.ReactNode;
  };

function Image({
  base64,
  uint8Array,
  mediaType,
  alt = "",
  className,
  children,
  ...props
}: ImageProps) {
  const [blobSrc, setBlobSrc] = React.useState<string>();
  const resolvedMediaType = React.useMemo(() => {
    if (!base64) return mediaType ?? "image/png";
    return resolveBase64MediaType(base64, mediaType ?? "image/png");
  }, [base64, mediaType]);
  const src = React.useMemo(() => {
    if (base64) {
      return toDataUrl(base64, resolvedMediaType);
    }
    return blobSrc;
  }, [base64, resolvedMediaType, blobSrc]);

  React.useEffect(() => {
    if (base64 || uint8Array == null || uint8Array.length === 0) {
      setBlobSrc(undefined);
      return;
    }

    const bytes = uint8Array;
    const buffer = Uint8Array.from(bytes).buffer;
    const blob = new Blob([buffer], { type: mediaType ?? "image/png" });
    const objectUrl = URL.createObjectURL(blob);
    setBlobSrc(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [base64, uint8Array, mediaType]);

  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  const contextValue = React.useMemo<ImageContextValue>(
    () => ({
      src,
      alt,
      mediaType: resolvedMediaType,
      hasError,
      setHasError,
    }),
    [src, alt, resolvedMediaType, hasError],
  );

  return (
    <ImageContext.Provider value={contextValue}>
      <div
        data-slot="image"
        className={cn(
          "group/image relative inline-flex aspect-auto max-w-full min-w-64 flex-col overflow-hidden rounded-[20px] border",
          className,
        )}
        {...props}
      >
        {children ?? <ImagePreview />}
      </div>
    </ImageContext.Provider>
  );
}

export type ImagePreviewProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src"
>;

function ImagePreview({
  className,
  alt: altProp,
  onLoad,
  onError,
  ...props
}: ImagePreviewProps) {
  const { src, alt, setHasError } = useImageContext("ImagePreview");

  if (!src) {
    return (
      <ImageLoader
        forceVisible
        aria-hidden
        className={cn("h-40 w-full", className)}
      />
    );
  }

  return (
    <div data-slot="image-preview" className="relative max-w-full">
      <ImageLoader className="absolute inset-0 z-0 h-full w-full rounded-md" />
      <img
        {...props}
        src={src}
        alt={altProp ?? alt}
        className={cn(
          "relative z-10 h-auto max-w-full overflow-hidden rounded-md w-full",
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
  );
}

export type ImageLoaderProps = React.HTMLAttributes<HTMLDivElement> & {
  forceVisible?: boolean;
};

function ImageLoader({
  className,
  forceVisible = false,
  ...props
}: ImageLoaderProps) {
  const { hasError } = useImageContext("ImageLoader");

  return (
    <div
      data-slot="image-loader"
      className={cn(
        "size-full animate-pulse rounded-[20px] bg-input transition-opacity",
        !forceVisible && "opacity-100",
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
};

function ImageAction({
  asChild = false,
  className,
  ...props
}: ImageActionProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="image-action"
      className={cn("pointer-events-auto", className)}
      {...props}
    />
  );
}

Image.displayName = "Image";
ImagePreview.displayName = "ImagePreview";
ImageLoader.displayName = "ImageLoader";
ImageActions.displayName = "ImageActions";
ImageActionGroup.displayName = "ImageActionGroup";
ImageAction.displayName = "ImageAction";

export {
  Image,
  ImagePreview,
  ImageLoader,
  ImageActions,
  ImageActionGroup,
  ImageAction,
};
