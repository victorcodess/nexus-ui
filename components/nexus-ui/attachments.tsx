"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Cancel01Icon,
  Image02Icon,
  File02Icon,
  Video02Icon,
  MusicNote02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/utils";

// ——— Metadata schema (single source) ———

/** Upload or message attachment metadata. */
export interface AttachmentMeta {
  type: "image" | "file" | "video" | "audio";
  name?: string;
  url?: string;
  /** Raster preview URL (e.g. PDF first page). When unset, preview uses the icon for `type`. */
  thumbnailUrl?: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  /** Binary payload when not using `url` (browser-friendly; prefer `Blob`). */
  data?: Blob | ArrayBuffer;
}

/** Files not appended by the picker: oversized, over `maxFiles`, or extra when `multiple` is false. */
export type AttachmentsRejectedFiles = {
  tooLarge: File[];
  /** Within size but did not fit under `maxFiles`. */
  overMaxFiles: File[];
  /** Ignored because `multiple` is false. */
  truncatedByMultiple: File[];
};

export function toAttachmentMeta(
  file: File,
  options?: { objectUrl?: string },
): AttachmentMeta {
  const mime = file.type?.toLowerCase() ?? "";
  let kind: AttachmentMeta["type"] = "file";
  if (mime.startsWith("image/")) kind = "image";
  else if (mime.startsWith("video/")) kind = "video";
  else if (mime.startsWith("audio/")) kind = "audio";

  return {
    type: kind,
    name: file.name,
    url: options?.objectUrl,
    mimeType: file.type || undefined,
    size: file.size,
  };
}

function formatBytes(bytes?: number): string | undefined {
  if (bytes == null || !Number.isFinite(bytes)) return undefined;
  const units = ["B", "KB", "MB", "GB"] as const;
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  const rounded = i === 0 ? Math.round(v) : Math.round(v * 10) / 10;
  return `${rounded} ${units[i]}`;
}

/** Uppercased file extension for the detailed subtitle (no leading dot); `undefined` if there is no usable extension. */
function kindLabel(item: AttachmentMeta): string | undefined {
  const name = item.name?.trim();
  if (!name) return undefined;
  const dot = name.lastIndexOf(".");
  if (dot <= 0 || dot >= name.length - 1) return undefined;
  const ext = name.slice(dot + 1).toLowerCase();
  if (!ext || ext.length > 16) return undefined;
  return ext.toUpperCase();
}

function iconForAttachmentType(type: AttachmentMeta["type"]) {
  switch (type) {
    case "image":
      return Image02Icon;
    case "video":
      return Video02Icon;
    case "audio":
      return MusicNote02Icon;
    default:
      return File02Icon;
  }
}

function inferDetailedSubtitleMode(
  attachment: AttachmentMeta,
): "size" | "kind" {
  if (
    attachment.size != null &&
    Number.isFinite(attachment.size) &&
    attachment.size > 0
  ) {
    return "size";
  }
  return "kind";
}

const attachmentVariants = cva(
  "group relative cursor-default overflow-hidden rounded-[6px] border border-gray-100 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300",
  {
    variants: {
      variant: {
        compact: "relative flex size-15 shrink-0 items-center justify-center",
        inline:
          "relative flex h-8 w-auto min-w-0 max-w-[200px] shrink-0 items-center justify-start p-1 pr-2",
        detailed:
          "relative flex h-15 w-auto min-w-[200px] max-w-[250px] shrink-0 items-center justify-start p-2 pr-3",
      },
    },
    defaultVariants: {
      variant: "compact",
    },
  },
);

type AttachmentVariant = NonNullable<
  VariantProps<typeof attachmentVariants>["variant"]
>;

// ——— Context ———

type AttachmentsContextValue = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** Stable id on the hidden file input (labels, tests, or custom `aria-*`). */
  inputId: string;
  openPicker: () => void;
  attachments: AttachmentMeta[];
  onAttachmentsChange: (next: AttachmentMeta[]) => void;
  accept?: string;
  multiple: boolean;
  maxFiles?: number;
  maxSize?: number;
  disabled: boolean;
};

const AttachmentsContext = React.createContext<AttachmentsContextValue | null>(
  null,
);

function useAttachmentsContext(component: string) {
  const ctx = React.useContext(AttachmentsContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Attachments>`);
  }
  return ctx;
}

type AttachmentItemContextValue = {
  variant: AttachmentVariant;
  attachment: AttachmentMeta;
  onRemove?: () => void;
};

const AttachmentItemContext =
  React.createContext<AttachmentItemContextValue | null>(null);

function useAttachmentItemContext(component: string) {
  const ctx = React.useContext(AttachmentItemContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Attachment>`);
  }
  return ctx;
}

export type AttachmentsProps = {
  attachments: AttachmentMeta[];
  onAttachmentsChange: (attachments: AttachmentMeta[]) => void;
  accept?: string;
  /** @default true */
  multiple?: boolean;
  maxFiles?: number;
  /** Maximum file size per file in bytes */
  maxSize?: number;
  disabled?: boolean;
  /** Fires after the internal file handler (same event; `target.files` still available). */
  onFileInputChange?: React.ChangeEventHandler<HTMLInputElement>;
  /**
   * Called when some selected files are not appended (oversized, over `maxFiles`, or trimmed because `multiple` is false).
   */
  onFilesRejected?: (detail: AttachmentsRejectedFiles) => void;
  children?: React.ReactNode;
};

function Attachments({
  attachments,
  onAttachmentsChange,
  accept,
  multiple = true,
  maxFiles,
  maxSize,
  disabled = false,
  onFileInputChange,
  onFilesRejected,
  children,
}: AttachmentsProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const inputId = React.useId();
  const managedBlobUrlsRef = React.useRef<Set<string>>(new Set());

  React.useLayoutEffect(() => {
    const inUse = new Set<string>();
    for (const a of attachments) {
      if (a.url) inUse.add(a.url);
      if (a.thumbnailUrl) inUse.add(a.thumbnailUrl);
    }
    for (const url of [...managedBlobUrlsRef.current]) {
      if (!inUse.has(url)) {
        URL.revokeObjectURL(url);
        managedBlobUrlsRef.current.delete(url);
      }
    }
  }, [attachments]);

  React.useEffect(() => {
    return () => {
      for (const url of managedBlobUrlsRef.current) {
        URL.revokeObjectURL(url);
      }
      managedBlobUrlsRef.current.clear();
    };
  }, []);

  const openPicker = React.useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (!list?.length || disabled) {
        onFileInputChange?.(e);
        e.target.value = "";
        return;
      }

      let incoming = Array.from(list);
      let truncatedByMultiple: File[] = [];
      if (!multiple && incoming.length > 1) {
        truncatedByMultiple = incoming.slice(1);
        incoming = incoming.slice(0, 1);
      }

      const tooLarge =
        maxSize != null ? incoming.filter((f) => f.size > maxSize) : [];

      const withinSize =
        maxSize != null ? incoming.filter((f) => f.size <= maxSize) : incoming;

      const room =
        maxFiles != null
          ? Math.max(0, maxFiles - attachments.length)
          : Number.POSITIVE_INFINITY;

      const take =
        room === Number.POSITIVE_INFINITY
          ? withinSize
          : withinSize.slice(0, room);

      const overMaxFiles =
        room === Number.POSITIVE_INFINITY ? [] : withinSize.slice(room);

      if (
        tooLarge.length > 0 ||
        overMaxFiles.length > 0 ||
        truncatedByMultiple.length > 0
      ) {
        onFilesRejected?.({
          tooLarge,
          overMaxFiles,
          truncatedByMultiple,
        });
      }

      const newMetas = take.map((file) => {
        const objectUrl = URL.createObjectURL(file);
        managedBlobUrlsRef.current.add(objectUrl);
        return toAttachmentMeta(file, { objectUrl });
      });

      if (newMetas.length > 0) {
        onAttachmentsChange([...attachments, ...newMetas]);
      }

      onFileInputChange?.(e);
      e.target.value = "";
    },
    [
      disabled,
      multiple,
      maxSize,
      maxFiles,
      attachments,
      onAttachmentsChange,
      onFileInputChange,
      onFilesRejected,
    ],
  );

  const value = React.useMemo<AttachmentsContextValue>(
    () => ({
      inputRef,
      inputId,
      openPicker,
      attachments,
      onAttachmentsChange,
      accept,
      multiple,
      maxFiles,
      maxSize,
      disabled,
    }),
    [
      inputId,
      attachments,
      onAttachmentsChange,
      accept,
      multiple,
      maxFiles,
      maxSize,
      disabled,
      openPicker,
    ],
  );

  return (
    <AttachmentsContext.Provider value={value}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        data-slot="attachments-input"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleInputChange}
      />
      {children}
    </AttachmentsContext.Provider>
  );
}

type AttachmentTriggerProps = React.ComponentProps<"button"> & {
  asChild?: boolean;
};

function AttachmentTrigger({
  asChild = false,
  className,
  children,
  onClick,
  disabled: disabledProp,
  ...props
}: AttachmentTriggerProps) {
  const { openPicker, disabled: rootDisabled } =
    useAttachmentsContext("AttachmentTrigger");
  const disabled = Boolean(rootDisabled || disabledProp);

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      onClick?.(e);
      openPicker();
    },
    [disabled, onClick, openPicker],
  );

  const triggerClassName = cn(
    disabled && "cursor-not-allowed opacity-50",
    className,
  );

  if (asChild) {
    return (
      <Slot
        {...props}
        data-slot="attachment-trigger"
        className={triggerClassName}
        aria-disabled={disabled}
        onClick={handleClick as React.MouseEventHandler<HTMLElement>}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      {...props}
      type="button"
      data-slot="attachment-trigger"
      className={triggerClassName}
      disabled={disabled}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

type AttachmentListProps = React.HTMLAttributes<HTMLDivElement>;

function AttachmentList({ className, role, ...props }: AttachmentListProps) {
  return (
    <div
      data-slot="attachment-list"
      role={role ?? "list"}
      className={cn(
        "flex w-full max-w-full min-w-0 flex-wrap items-center justify-center gap-2.5 overflow-x-auto overscroll-x-contain pb-0.5 [scrollbar-color:var(--scrollbar-thumb)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

type AttachmentOverflowFadeLayerProps = React.HTMLAttributes<HTMLDivElement> & {
  variant: "inline" | "detailed";
};

function AttachmentOverflowFadeLayer({
  className,
  variant,
  ...props
}: AttachmentOverflowFadeLayerProps) {
  return (
    <div
      aria-hidden
      data-slot="attachment-overflow-fade"
      className={cn(
        "pointer-events-none absolute top-1/2 right-0 w-10 -translate-y-1/2 bg-linear-to-l from-gray-100 from-65% to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-gray-700",
        variant === "detailed" ? "h-15" : "h-8",
        className,
      )}
      {...props}
    />
  );
}

type AttachmentProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  variant?: AttachmentVariant;
  /** Attachment metadata; drives preview and properties. */
  attachment: AttachmentMeta;
  /** Upload progress 0–100; shows a bottom bar when set */
  progress?: number;
  onRemove?: () => void;
  /** Detailed layout: second line; inferred from `attachment.size` when omitted. */
  detailedSubtitle?: "size" | "kind";
  /**
   * When set, replaces the default layout.
   */
  children?: React.ReactNode;
};

function Attachment({
  className,
  variant = "compact",
  attachment,
  progress,
  onRemove,
  detailedSubtitle: detailedSubtitleProp,
  children,
  ...props
}: AttachmentProps) {
  const detailedSubtitle =
    variant === "detailed"
      ? (detailedSubtitleProp ?? inferDetailedSubtitleMode(attachment))
      : undefined;

  const ctxValue = React.useMemo<AttachmentItemContextValue>(
    () => ({ variant: variant ?? "compact", attachment, onRemove }),
    [variant, attachment, onRemove],
  );

  const showProgress = progress != null && Number.isFinite(progress);

  const defaultLayout =
    variant === "compact" ? (
      <>
        <AttachmentRemove />
        <AttachmentPreview />
      </>
    ) : variant === "detailed" ? (
      <>
        <AttachmentRemove />
        <div className="flex min-w-0 items-center gap-2">
          <AttachmentPreview />
          <AttachmentInfo>
            <AttachmentProperty as="name" />
            <AttachmentProperty
              as={detailedSubtitle === "size" ? "size" : "kind"}
            />
          </AttachmentInfo>
        </div>
      </>
    ) : (
      <>
        <AttachmentRemove />
        <div className="flex min-w-0 items-center gap-1">
          <AttachmentPreview />
          <AttachmentProperty as="name" />
        </div>
      </>
    );

  return (
    <AttachmentItemContext.Provider value={ctxValue}>
      <div
        data-slot="attachment"
        data-variant={variant}
        role="listitem"
        className={cn(attachmentVariants({ variant }), className)}
        {...props}
      >
        {variant === "inline" || variant === "detailed" ? (
          <AttachmentOverflowFadeLayer variant={variant} />
        ) : null}
        {children ?? defaultLayout}
        {showProgress ? <AttachmentProgress value={progress} /> : null}
      </div>
    </AttachmentItemContext.Provider>
  );
}

const attachmentPreviewVariants = cva(
  "flex shrink-0 items-center justify-center overflow-hidden bg-white text-gray-400 dark:bg-gray-800 dark:text-gray-300",
  {
    variants: {
      variant: {
        compact:
          "absolute inset-0 size-full rounded-[inherit] border-0 bg-transparent dark:bg-transparent",
        inline:
          "size-6 rounded-[4px] border border-gray-200 dark:border-gray-600",
        detailed:
          "size-11 rounded-[6px] border border-gray-200 dark:border-gray-600",
      },
    },
    defaultVariants: {
      variant: "compact",
    },
  },
);

type AttachmentPreviewProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  Partial<VariantProps<typeof attachmentPreviewVariants>>;

function AttachmentPreview({
  className,
  variant: variantProp,
  ...props
}: AttachmentPreviewProps) {
  const { variant, attachment } = useAttachmentItemContext("AttachmentPreview");
  const v = variantProp ?? variant;
  const rasterSrc =
    attachment.thumbnailUrl ??
    (attachment.type === "image" && attachment.url
      ? attachment.url
      : undefined);
  const videoSrc =
    !attachment.thumbnailUrl && attachment.type === "video" && attachment.url
      ? attachment.url
      : undefined;
  const showRaster = Boolean(rasterSrc);
  const showVideo = Boolean(videoSrc);
  const inlinePlainIcon =
    v === "inline" && !showRaster && !showVideo
      ? "border-0 bg-transparent dark:bg-transparent"
      : "";

  const iconClass = v === "inline" ? "size-5" : "size-7";

  const content = (() => {
    if (rasterSrc) {
      return (
        <>
          <div className="absolute inset-0 z-0 size-full animate-pulse bg-gray-200 dark:bg-gray-900" />
          <img
            src={rasterSrc}
            alt=""
            className="relative z-1 size-full object-cover"
          />
        </>
      );
    }
    if (videoSrc) {
      return (
        <>
          <div className="absolute inset-0 z-0 size-full animate-pulse bg-gray-200 dark:bg-gray-900" />
          <video
            src={videoSrc}
            muted
            playsInline
            preload="metadata"
            aria-hidden
            className="relative z-1 size-full object-cover"
          />
        </>
      );
    }
    return (
      <HugeiconsIcon
        icon={iconForAttachmentType(attachment.type)}
        strokeWidth={1.5}
        className={iconClass}
        aria-hidden
      />
    );
  })();

  return (
    <div
      data-slot="attachment-preview"
      className={cn(
        attachmentPreviewVariants({ variant: v }),
        inlinePlainIcon,
        className,
        "relative",
      )}
      {...props}
    >
      {content}
    </div>
  );
}

const removeButtonVariants = cva(
  "z-10 flex size-4.5 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-400 sm:opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-200 hover:text-gray-500 active:scale-97 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-100",
  {
    variants: {
      position: {
        corner: "absolute top-1 right-1",
        "center-end": "absolute top-1/2 right-1 -translate-y-1/2",
      },
    },
    defaultVariants: {
      position: "corner",
    },
  },
);

type AttachmentRemoveProps = React.ComponentProps<"button"> &
  VariantProps<typeof removeButtonVariants> & {
    asChild?: boolean;
  };

function AttachmentRemove({
  className,
  asChild = false,
  position: positionProp,
  children,
  type: _type,
  onClick,
  "aria-label": ariaLabelProp,
  ...props
}: AttachmentRemoveProps) {
  const { variant, attachment, onRemove } =
    useAttachmentItemContext("AttachmentRemove");
  const position =
    positionProp ?? (variant === "inline" ? "center-end" : "corner");

  const ariaLabel =
    ariaLabelProp ?? `Remove ${attachment.name ?? "attachment"}`;

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      onRemove?.();
    },
    [onClick, onRemove],
  );

  if (asChild) {
    return (
      <Slot
        className={cn(removeButtonVariants({ position }), className)}
        aria-label={ariaLabel}
        onClick={handleClick as React.MouseEventHandler<HTMLElement>}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      type="button"
      data-slot="attachment-remove"
      className={cn(removeButtonVariants({ position }), className)}
      aria-label={ariaLabel}
      onClick={handleClick}
      {...props}
    >
      {children ?? (
        <HugeiconsIcon
          icon={Cancel01Icon}
          strokeWidth={2.5}
          className="size-3"
          aria-hidden
        />
      )}
    </button>
  );
}

type AttachmentInfoProps = React.HTMLAttributes<HTMLDivElement>;

function AttachmentInfo({ className, ...props }: AttachmentInfoProps) {
  return (
    <div
      data-slot="attachment-info"
      className={cn("flex min-w-0 flex-col gap-0", className)}
      {...props}
    />
  );
}

type AttachmentPropertyAs = "name" | "size" | "kind";

type AttachmentPropertyProps = Omit<
  React.HTMLAttributes<HTMLParagraphElement>,
  "children"
> & {
  as: AttachmentPropertyAs;
};

function AttachmentProperty({
  as: mode,
  className,
  ...props
}: AttachmentPropertyProps) {
  const { attachment } = useAttachmentItemContext("AttachmentProperty");
  let text: string;
  if (mode === "name") {
    text = attachment.name ?? "";
  } else if (mode === "size") {
    text = formatBytes(attachment.size) ?? "—";
  } else {
    text = kindLabel(attachment) ?? "—";
  }

  const isTitle = mode === "name";
  return (
    <p
      data-slot="attachment-property"
      data-as={mode}
      className={cn(
        isTitle
          ? "my-0! truncate text-sm leading-6 font-[450] text-gray-900 dark:text-gray-100"
          : "my-0! text-xs font-[350] text-gray-500 dark:text-gray-400",
        className,
      )}
      {...props}
    >
      {text}
    </p>
  );
}

type AttachmentProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  /** 0–100 */
  value: number;
};

function AttachmentProgress({
  className,
  value,
  ...props
}: AttachmentProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      data-slot="attachment-progress"
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gray-200/90 dark:bg-gray-600/90",
        className,
      )}
      {...props}
    >
      <div
        className="h-full bg-gray-900 transition-[width] duration-200 dark:bg-gray-100"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

Attachments.displayName = "Attachments";
AttachmentTrigger.displayName = "AttachmentTrigger";
AttachmentList.displayName = "AttachmentList";
Attachment.displayName = "Attachment";
AttachmentPreview.displayName = "AttachmentPreview";
AttachmentRemove.displayName = "AttachmentRemove";
AttachmentInfo.displayName = "AttachmentInfo";
AttachmentProperty.displayName = "AttachmentProperty";
AttachmentProgress.displayName = "AttachmentProgress";

export {
  Attachments,
  AttachmentTrigger,
  AttachmentList,
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  AttachmentInfo,
  AttachmentProperty,
  AttachmentProgress,
};

export default Attachments;
