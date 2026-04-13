"use client";

import * as React from "react";
import {
  ArrowUp02Icon,
  PlusSignIcon,
  SquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  Attachment,
  AttachmentList,
  Attachments,
  AttachmentsDropOverlay,
  AttachmentTrigger,
  filesFromDataTransfer,
  useAttachments,
  type AttachmentMeta,
} from "@/components/nexus-ui/attachments";
import PromptInput, {
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { Button } from "@/components/ui/button";

function attachmentKey(a: AttachmentMeta) {
  return `${a.name ?? ""}-${a.size ?? ""}-${a.mimeType ?? ""}-${a.source ?? ""}-${a.url ?? ""}`;
}

type InputStatus = "idle" | "loading" | "error" | "submitted";

const maxAttachmentSize = 500 * 1024 * 1024;

/** Plain-text paste longer than this becomes a **`source: "paste"`** attachment (`variant="pasted"`). */
const pasteTextAsFileMinChars = 2000;

/** Must render under **`Attachments`** — uses **`appendFiles`** from context. */
function PromptInputTextareaWithPaste(
  props: React.ComponentProps<typeof PromptInputTextarea>,
) {
  const { appendFiles, disabled } = useAttachments();
  const { onPaste, ...textareaProps } = props;

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      onPaste?.(e);
      if (e.defaultPrevented || disabled) return;

      const imageFiles = filesFromDataTransfer(e.clipboardData).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (imageFiles.length > 0) {
        e.preventDefault();
        appendFiles(imageFiles);
        return;
      }

      const text = e.clipboardData.getData("text/plain");
      if (text.length >= pasteTextAsFileMinChars) {
        e.preventDefault();
        appendFiles(
          [new File([text], "pasted-text.txt", { type: "text/plain" })],
          { paste: true },
        );
      }
    },
    [appendFiles, disabled, onPaste],
  );

  return (
    <PromptInputTextarea {...textareaProps} onPaste={handlePaste} />
  );
}

function AttachmentsWithPromptInput() {
  const [message, setMessage] = React.useState("");
  const [attachments, setAttachments] = React.useState<AttachmentMeta[]>([]);
  const [status, setStatus] = React.useState<InputStatus>("idle");
  /** Per-attachment demo progress; only keys for newly added files are set. */
  const [progressByKey, setProgressByKey] = React.useState<
    Record<string, number>
  >({});

  const syncAttachments = React.useCallback((next: AttachmentMeta[]) => {
    setAttachments((prev) => {
      for (const a of prev) {
        const u = a.url;
        if (u?.startsWith("blob:") && !next.some((n) => n.url === u)) {
          URL.revokeObjectURL(u);
        }
      }
      return next;
    });
  }, []);

  const attachmentsRef = React.useRef(attachments);
  attachmentsRef.current = attachments;

  const intervalsRef = React.useRef<Map<string, number>>(new Map());
  const timeoutsRef = React.useRef<Map<string, number>>(new Map());
  const prevAttachmentKeysRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    const current = new Set(attachments.map(attachmentKey));

    const clearKeyTimers = (key: string) => {
      const intId = intervalsRef.current.get(key);
      if (intId != null) {
        clearInterval(intId);
        intervalsRef.current.delete(key);
      }
      const toId = timeoutsRef.current.get(key);
      if (toId != null) {
        clearTimeout(toId);
        timeoutsRef.current.delete(key);
      }
    };

    for (const key of [
      ...intervalsRef.current.keys(),
      ...timeoutsRef.current.keys(),
    ]) {
      if (!current.has(key)) clearKeyTimers(key);
    }

    setProgressByKey((p) => {
      const next = { ...p };
      let changed = false;
      for (const k of Object.keys(next)) {
        if (!current.has(k)) {
          delete next[k];
          changed = true;
        }
      }
      return changed ? next : p;
    });

    const newKeys = [...current].filter(
      (k) => !prevAttachmentKeysRef.current.has(k),
    );

    for (const key of newKeys) {
      const added = attachments.find((a) => attachmentKey(a) === key);
      if (added?.source === "paste") continue;

      clearKeyTimers(key);

      setProgressByKey((p) => ({ ...p, [key]: 0 }));

      const t0 = Date.now();
      const duration = 2000;
      const intId = window.setInterval(() => {
        if (!attachmentsRef.current.some((a) => attachmentKey(a) === key)) {
          clearKeyTimers(key);
          return;
        }
        const pct = Math.min(
          100,
          Math.round(((Date.now() - t0) / duration) * 100),
        );
        setProgressByKey((prev) => ({ ...prev, [key]: pct }));

        if (pct >= 100) {
          clearInterval(intId);
          intervalsRef.current.delete(key);
          setProgressByKey((prev) => ({ ...prev, [key]: 100 }));

          const toId = window.setTimeout(() => {
            timeoutsRef.current.delete(key);
            setProgressByKey((prev) => {
              if (!(key in prev)) return prev;
              const { [key]: _, ...rest } = prev;
              return rest;
            });
          }, 300);
          timeoutsRef.current.set(key, toId);
        }
      }, 50);
      intervalsRef.current.set(key, intId);
    }

    prevAttachmentKeysRef.current = current;
  }, [attachments]);

  React.useEffect(
    () => () => {
      for (const id of intervalsRef.current.values()) {
        clearInterval(id);
      }
      for (const id of timeoutsRef.current.values()) {
        clearTimeout(id);
      }
      intervalsRef.current.clear();
      timeoutsRef.current.clear();
    },
    [],
  );

  React.useEffect(
    () => () => {
      for (const a of attachmentsRef.current) {
        if (a.url?.startsWith("blob:")) URL.revokeObjectURL(a.url);
      }
    },
    [],
  );

  const removeAttachment = React.useCallback(
    (item: AttachmentMeta) => {
      syncAttachments(
        attachmentsRef.current.filter(
          (a) => attachmentKey(a) !== attachmentKey(item),
        ),
      );
    },
    [syncAttachments],
  );

  const handleSubmit = React.useCallback(
    (value: string) => {
      if (status === "loading") return;
      const trimmed = value.trim();
      if (!trimmed && attachmentsRef.current.length === 0) return;
      setMessage("");
      syncAttachments([]);
      setStatus("loading");
      window.setTimeout(() => {
        setStatus("submitted");
        window.setTimeout(() => setStatus("idle"), 800);
      }, 2500);
    },
    [syncAttachments, status],
  );

  const isLoading = status === "loading";
  const canSend = message.trim().length > 0 || attachments.length > 0;

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* Attachments outer: easy to wrap a full chat column for page-level drag-and-drop */}
      <Attachments
        attachments={attachments}
        onAttachmentsChange={syncAttachments}
        accept="*/*"
        multiple
        maxSize={maxAttachmentSize}
        windowDrop
      >
        <AttachmentsDropOverlay />
        <PromptInput onSubmit={handleSubmit}>
          {attachments.length > 0 ? (
            <AttachmentList className="min-h-0 flex-nowrap justify-start overflow-x-auto overflow-y-hidden px-4 pt-4 [scrollbar-color:var(--scrollbar-thumb)_transparent] [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent">
              {attachments.map((item) => {
                const key = attachmentKey(item);
                const progress = progressByKey[key];
                const isPasted = item.source === "paste";
                return (
                  <Attachment
                    key={key}
                    variant={isPasted ? "pasted" : "detailed"}
                    attachment={item}
                    progress={isPasted ? undefined : progress}
                    onRemove={() => removeAttachment(item)}
                  />
                );
              })}
            </AttachmentList>
          ) : null}
          <PromptInputTextareaWithPaste
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message with attachments…"
            disabled={isLoading}
          />
          <PromptInputActions>
            <PromptInputActionGroup>
              <PromptInputAction>
                <AttachmentTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer rounded-full text-secondary-foreground active:scale-97 disabled:opacity-70 hover:dark:bg-secondary"
                  >
                    <HugeiconsIcon
                      icon={PlusSignIcon}
                      strokeWidth={2.0}
                      className="size-4"
                    />
                  </Button>
                </AttachmentTrigger>
              </PromptInputAction>
            </PromptInputActionGroup>
            <PromptInputActionGroup>
              <PromptInputAction asChild>
                <Button
                  type="button"
                  size="icon-sm"
                  className="cursor-pointer rounded-full active:scale-97 disabled:opacity-70"
                  disabled={!isLoading && !canSend}
                  onClick={() => handleSubmit(message)}
                >
                  {isLoading ? (
                    <HugeiconsIcon
                      icon={SquareIcon}
                      strokeWidth={2.0}
                      className="size-3.5 fill-current"
                    />
                  ) : (
                    <HugeiconsIcon
                      icon={ArrowUp02Icon}
                      strokeWidth={2.0}
                      className="size-4"
                    />
                  )}
                </Button>
              </PromptInputAction>
            </PromptInputActionGroup>
          </PromptInputActions>
        </PromptInput>
      </Attachments>
    </div>
  );
}

export default AttachmentsWithPromptInput;
