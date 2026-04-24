"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Cancel01Icon,
  Image02Icon,
  File02Icon,
  Video02Icon,
  MusicNote02Icon,
  Upload01Icon,
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
  /**
   * **`"paste"`** when created from clipboard (e.g. long text → **`File`**). Use with **`Attachment`** **`variant="pasted"`**.
   */
  source?: "paste";
}

/** Files not appended by the picker: oversized, over `maxFiles`, extra when `multiple` is false, or outside `accept`. */
export type AttachmentsRejectedFiles = {
  tooLarge: File[];
  /** Within size but did not fit under `maxFiles`. */
  overMaxFiles: File[];
  /** Ignored because `multiple` is false. */
  truncatedByMultiple: File[];
  /** Did not match the root `accept` string (drop path or permissive pickers). */
  notAccepted: File[];
};

export function toAttachmentMeta(
  file: File,
  options?: { objectUrl?: string; source?: AttachmentMeta["source"] },
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
    ...(options?.source != null ? { source: options.source } : {}),
  };
}

/** Optional second argument to **`appendFiles`** (from **`useAttachments`**). */
export type AppendFilesOptions = {
  /** Sets **`AttachmentMeta.source`** to **`"paste"`** for every appended item. */
  paste?: boolean;
};

/**
 * `File`s from a `DataTransfer` (paste **`clipboardData`** or drop **`dataTransfer`**).
 * Prefer **`items`** so pasted screenshots and copied images resolve reliably; falls back to **`files`**.
 */
export function filesFromDataTransfer(data: DataTransfer | null): File[] {
  if (!data) return [];
  const out: File[] = [];
  if (data.items?.length) {
    for (const item of data.items) {
      if (item.kind !== "file") continue;
      const f = item.getAsFile();
      if (f) out.push(f);
    }
  }
  if (out.length > 0) return out;
  if (data.files?.length) return Array.from(data.files);
  return [];
}

/** Best-effort match for an HTML `accept` attribute (comma tokens: `.pdf`, `image/*`, exact MIME). */
function fileMatchesAccept(file: File, accept: string): boolean {
  const trimmed = accept.trim();
  if (!trimmed || trimmed === "*/*") return true;
  const tokens = trimmed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const type = (file.type ?? "").toLowerCase();
  const name = file.name ?? "";
  const extWithDot =
    name.lastIndexOf(".") > 0
      ? name.slice(name.lastIndexOf(".")).toLowerCase()
      : "";

  for (const token of tokens) {
    const t = token.toLowerCase();
    if (t === "*/*") return true;
    if (t.startsWith(".")) {
      if (extWithDot === t) return true;
      continue;
    }
    if (t.endsWith("/*")) {
      const prefix = t.slice(0, -1);
      if (type.startsWith(prefix)) return true;
      continue;
    }
    if (type && type === t) return true;
  }
  return false;
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
  "group relative cursor-default overflow-hidden rounded-[6px] border border-muted bg-secondary text-muted-foreground",
  {
    variants: {
      variant: {
        compact: "relative flex size-15 shrink-0 items-center justify-center",
        inline:
          "relative flex h-8 w-auto min-w-0 max-w-[200px] shrink-0 items-center justify-start p-1 pr-2",
        detailed:
          "relative flex h-15 w-auto min-w-[200px] max-w-[250px] shrink-0 items-center justify-start p-2 pr-3",
        pasted:
          "relative flex w-[156px] h-[144px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-[6px] p-2 gap-2",
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

/** Public context value from **`useAttachments()`** (also used internally by **`Attachments`**). */
export type AttachmentsContextValue = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** Stable id on the hidden file input (labels, tests, or custom `aria-*`). */
  inputId: string;
  openPicker: () => void;
  /**
   * Append files with the same limits and `onFilesRejected` behavior as the native picker.
   * For drag-and-drop or paste, call this from your handler.
   */
  appendFiles: (files: File[], options?: AppendFilesOptions) => void;
  /** True while a file drag is active over the document (when `windowDrop` is enabled). */
  isDraggingFile: boolean;
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
  /** When true, remove controls are hidden (see `Attachment` `readOnly`). */
  readOnly?: boolean;
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
  /**
   * Register `dragover` / `drop` on `document` so files can be dropped anywhere.
   * Pair with **`AttachmentsDropOverlay`** or **`useAttachments().appendFiles`** if you build a custom drop target.
   * @default false
   */
  windowDrop?: boolean;
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
  windowDrop = false,
  children,
}: AttachmentsProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const inputId = React.useId();
  const managedBlobUrlsRef = React.useRef<Set<string>>(new Set());
  const [isDraggingFile, setIsDraggingFile] = React.useState(false);

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

  const appendFilesFromList = React.useCallback(
    (rawFiles: File[], appendOptions?: AppendFilesOptions) => {
      if (disabled || rawFiles.length === 0) return;

      let incoming = [...rawFiles];
      const notAccepted =
        accept != null && accept !== "" && accept !== "*/*"
          ? incoming.filter((f) => !fileMatchesAccept(f, accept))
          : [];
      if (accept != null && accept !== "" && accept !== "*/*") {
        incoming = incoming.filter((f) => fileMatchesAccept(f, accept));
      }

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
        notAccepted.length > 0 ||
        tooLarge.length > 0 ||
        overMaxFiles.length > 0 ||
        truncatedByMultiple.length > 0
      ) {
        onFilesRejected?.({
          notAccepted,
          tooLarge,
          overMaxFiles,
          truncatedByMultiple,
        });
      }

      const newMetas = take.map((file) => {
        const objectUrl = URL.createObjectURL(file);
        managedBlobUrlsRef.current.add(objectUrl);
        return toAttachmentMeta(file, {
          objectUrl,
          source: appendOptions?.paste ? "paste" : undefined,
        });
      });

      if (newMetas.length > 0) {
        onAttachmentsChange([...attachments, ...newMetas]);
      }
    },
    [
      disabled,
      accept,
      multiple,
      maxSize,
      maxFiles,
      attachments,
      onAttachmentsChange,
      onFilesRejected,
    ],
  );

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (!list?.length || disabled) {
        onFileInputChange?.(e);
        e.target.value = "";
        return;
      }

      appendFilesFromList(Array.from(list));
      onFileInputChange?.(e);
      e.target.value = "";
    },
    [disabled, appendFilesFromList, onFileInputChange],
  );

  React.useEffect(() => {
    if (disabled || !windowDrop) {
      setIsDraggingFile(false);
      return;
    }

    const hasFiles = (e: DragEvent) =>
      Boolean(
        e.dataTransfer?.types?.length &&
        [...e.dataTransfer.types].includes("Files"),
      );

    const onDragEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      setIsDraggingFile(true);
    };

    const onDragLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      const next = e.relatedTarget as Node | null;
      if (next && document.contains(next)) return;
      setIsDraggingFile(false);
    };

    const onDragOver = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      e.dataTransfer!.dropEffect = "copy";
    };

    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingFile(false);
      const list = e.dataTransfer?.files;
      if (!list?.length) return;
      appendFilesFromList(Array.from(list));
    };

    document.addEventListener("dragenter", onDragEnter);
    document.addEventListener("dragleave", onDragLeave);
    document.addEventListener("dragover", onDragOver);
    document.addEventListener("drop", onDrop);
    return () => {
      document.removeEventListener("dragenter", onDragEnter);
      document.removeEventListener("dragleave", onDragLeave);
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("drop", onDrop);
    };
  }, [disabled, windowDrop, appendFilesFromList]);

  const value = React.useMemo<AttachmentsContextValue>(
    () => ({
      inputRef,
      inputId,
      openPicker,
      appendFiles: appendFilesFromList,
      isDraggingFile,
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
      appendFilesFromList,
      isDraggingFile,
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

/** Access **`Attachments`** context: **`appendFiles`**, **`isDraggingFile`**, **`openPicker`**, controlled state, and limits. Must be used under **`Attachments`**. */
export function useAttachments(): AttachmentsContextValue {
  return useAttachmentsContext("useAttachments");
}

export type AttachmentsDropOverlayProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /**
   * `fullscreen` portals to `document.body` and covers the viewport.
   * `contained` fills the nearest positioned ancestor — wrap a **`relative`** container (e.g. prompt shell).
   * @default "fullscreen"
   */
  variant?: "fullscreen" | "contained";
  children?: React.ReactNode;
};

export function AttachmentsDropOverlay({
  variant = "fullscreen",
  className,
  children,
  ...props
}: AttachmentsDropOverlayProps) {
  const { isDraggingFile, disabled, maxSize } = useAttachmentsContext(
    "AttachmentsDropOverlay",
  );
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const open = mounted && !disabled && isDraggingFile;

  React.useEffect(() => {
    if (!open || variant !== "fullscreen") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, variant]);

  if (!open) return null;

  const maxSizeLabel = maxSize != null ? formatBytes(maxSize) : undefined;

  const inner = (
    <div
      data-slot="attachments-drop-overlay"
      role="presentation"
      aria-hidden
      className={cn(
        "pointer-events-none bg-background/50 backdrop-blur-sm",
        variant === "fullscreen"
          ? "fixed inset-0 z-50 flex items-center justify-center"
          : "absolute inset-0 z-10 flex items-center justify-center rounded-[inherit]",
        className,
      )}
      {...props}
    >
      {children ?? (
        <div className="flex flex-col items-center gap-3">
          <HugeiconsIcon
            icon={Upload01Icon}
            className="size-5 text-primary"
          />

          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-[350] text-primary">
              Drop files here to add as attachment
            </p>
            {maxSizeLabel ? (
              <p className="text-xs font-[350] text-muted-foreground">
                Maximum {maxSizeLabel} per file
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );

  if (variant === "fullscreen") {
    return createPortal(inner, document.body);
  }
  return inner;
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
        "flex w-full max-w-full min-w-0 flex-wrap items-end justify-center gap-2.5 overflow-x-auto overscroll-x-contain pb-0.5 [scrollbar-color:var(--scrollbar-thumb)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent",
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
        "pointer-events-none absolute top-1/2 right-0 w-10 -translate-y-1/2 bg-linear-to-l from-secondary from-65% to-transparent transition-opacity group-hover:opacity-100 sm:opacity-0",
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
  /**
   * When true, hides remove controls and the progress bar (e.g. message history).
   * @default false
   */
  readOnly?: boolean;
  /** Detailed layout: second line; inferred from `attachment.size` when omitted. */
  detailedSubtitle?: "size" | "kind";
  /**
   * When set, replaces the default layout.
   */
  children?: React.ReactNode;
  /**
   * `pasted` only: maximum characters in the preview line (remainder as ellipsis).
   * @default 220
   */
  pastedExcerptMaxChars?: number;
};

function Attachment({
  className,
  variant = "compact",
  attachment,
  progress,
  onRemove,
  readOnly = false,
  detailedSubtitle: detailedSubtitleProp,
  pastedExcerptMaxChars = 220,
  children,
  ...props
}: AttachmentProps) {
  const detailedSubtitle =
    variant === "detailed"
      ? (detailedSubtitleProp ?? inferDetailedSubtitleMode(attachment))
      : undefined;

  const ctxValue = React.useMemo<AttachmentItemContextValue>(
    () => ({
      variant: variant ?? "compact",
      attachment,
      onRemove,
      readOnly,
    }),
    [variant, attachment, onRemove, readOnly],
  );

  const showProgress =
    !readOnly && progress != null && Number.isFinite(progress);

  const defaultLayout =
    variant === "pasted" ? (
      <>
        <AttachmentPreview pastedExcerptMaxChars={pastedExcerptMaxChars} />

        {!readOnly ? (
          <div className="flex h-6 w-full items-center justify-between gap-2 rounded-[6px] bg-card pr-1 pl-2">
            <span className="text-xs leading-4 font-[350] text-muted-foreground uppercase">
              Pasted
            </span>
            <AttachmentRemove
              position="inline"
              className="bg-transparent text-muted-foreground hover:bg-muted dark:bg-transparent dark:hover:bg-muted"
            />
          </div>
        ) : null}
      </>
    ) : variant === "compact" ? (
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
        {showProgress && variant !== "pasted" ? (
          <AttachmentProgress value={progress} />
        ) : null}
      </div>
    </AttachmentItemContext.Provider>
  );
}

const attachmentPreviewVariants = cva(
  "flex shrink-0 items-center justify-center overflow-hidden bg-card text-muted-foreground",
  {
    variants: {
      variant: {
        compact:
          "absolute inset-0 size-full rounded-[inherit] border-0 bg-transparent",
        inline:
          "size-6 rounded-[4px] border border-input",
        detailed:
          "size-11 rounded-[6px] border border-input",
        pasted:
          "min-h-0 w-full flex-1 shrink self-stretch items-start justify-start border-0 bg-transparent p-0",
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
  Partial<VariantProps<typeof attachmentPreviewVariants>> & {
    /**
     * `pasted` only: max characters before ellipsis (from **`Attachment`** **`pastedExcerptMaxChars`**).
     * @default 220
     */
    pastedExcerptMaxChars?: number;
  };

function AttachmentPreview({
  className,
  variant: variantProp,
  pastedExcerptMaxChars = 220,
  ...props
}: AttachmentPreviewProps) {
  const { variant, attachment } = useAttachmentItemContext("AttachmentPreview");
  const v = variantProp ?? variant;
  const [pastedRawText, setPastedRawText] = React.useState("");

  React.useEffect(() => {
    if (v !== "pasted") return;

    let cancelled = false;

    const run = async () => {
      if (attachment.data instanceof Blob) {
        const t = await attachment.data.text();
        if (!cancelled) setPastedRawText(t);
        return;
      }
      if (attachment.data instanceof ArrayBuffer) {
        const t = new TextDecoder().decode(attachment.data);
        if (!cancelled) setPastedRawText(t);
        return;
      }
      const url = attachment.url;
      if (url?.startsWith("blob:") || url?.startsWith("data:")) {
        try {
          const res = await fetch(url);
          const t = await res.text();
          if (!cancelled) setPastedRawText(t);
        } catch {
          if (!cancelled) setPastedRawText("");
        }
        return;
      }
      if (!cancelled) setPastedRawText("");
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [v, attachment.data, attachment.url]);

  const pastedExcerpt = React.useMemo(() => {
    if (v !== "pasted") return "";
    const normalized = pastedRawText.replace(/\s+/g, " ").trim();
    const max = pastedExcerptMaxChars;
    if (normalized.length <= max) return normalized;
    return `${normalized.slice(0, max).trimEnd()}…`;
  }, [v, pastedRawText, pastedExcerptMaxChars]);

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
    if (v === "pasted") {
      return (
        <p
          data-slot="attachment-preview-excerpt"
          className="my-0! line-clamp-6 text-xs leading-4 font-[350] text-ring"
        >
          {pastedExcerpt.length > 0 ? pastedExcerpt : "\u00a0"}
        </p>
      );
    }
    if (rasterSrc) {
      return (
        <>
          <div className="absolute inset-0 z-0 size-full animate-pulse bg-input" />
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
          <div className="absolute inset-0 z-0 size-full animate-pulse bg-input" />
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
        v !== "pasted" && "relative",
        className,
      )}
      {...props}
    >
      {content}
    </div>
  );
}

const removeButtonVariants = cva(
  "z-10 flex size-4.5 cursor-pointer items-center justify-center rounded-full bg-secondary text-muted-foreground sm:opacity-0 transition-all group-hover:opacity-100 hover:bg-border hover:text-primary active:scale-97",
  {
    variants: {
      position: {
        corner: "absolute top-1 right-1",
        "center-end": "absolute top-1/2 right-1 -translate-y-1/2",
        /** Inline footer (e.g. **`variant="pasted"`**): always visible. */
        inline: "relative shrink-0 opacity-100 sm:opacity-100",
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
  const { variant, attachment, onRemove, readOnly } =
    useAttachmentItemContext("AttachmentRemove");
  const position =
    positionProp ?? (variant === "inline" ? "center-end" : "corner");

  const ariaLabel =
    ariaLabelProp ?? `Remove ${attachment.name ?? "attachment"}`;

  if (readOnly) {
    return null;
  }

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
          ? "my-0! truncate text-sm leading-6 font-[450] text-primary"
          : "my-0! text-xs font-[350] text-muted-foreground",
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
        "pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-border/90",
        className,
      )}
      {...props}
    >
      <div
        className="h-full bg-foreground transition-[width] duration-200 dark:bg-primary"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

Attachments.displayName = "Attachments";
AttachmentsDropOverlay.displayName = "AttachmentsDropOverlay";
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
