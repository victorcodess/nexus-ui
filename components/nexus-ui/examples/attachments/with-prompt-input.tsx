"use client";

import * as React from "react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  Attachment,
  AttachmentList,
  Attachments,
  AttachmentTrigger,
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
  return `${a.name ?? ""}-${a.size ?? ""}-${a.mimeType ?? ""}-${a.url ?? ""}`;
}

function AttachmentsWithPromptInput() {
  const [message, setMessage] = React.useState("");
  const [attachments, setAttachments] = React.useState<AttachmentMeta[]>([]);

  const syncAttachments = React.useCallback((next: AttachmentMeta[]) => {
    setAttachments((prev) => {
      for (const a of prev) {
        const u = a.url;
        if (
          u?.startsWith("blob:") &&
          !next.some((n) => n.url === u)
        ) {
          URL.revokeObjectURL(u);
        }
      }
      return next;
    });
  }, []);

  const attachmentsRef = React.useRef(attachments);
  attachmentsRef.current = attachments;
  React.useEffect(
    () => () => {
      for (const a of attachmentsRef.current) {
        if (a.url?.startsWith("blob:")) URL.revokeObjectURL(a.url);
      }
    },
    [],
  );

  const removeAttachment = React.useCallback((item: AttachmentMeta) => {
    syncAttachments(
      attachmentsRef.current.filter(
        (a) => attachmentKey(a) !== attachmentKey(item),
      ),
    );
  }, [syncAttachments]);

  return (
    <div className="mx-auto w-full max-w-xl">
      <PromptInput
        onSubmit={() => {
          setMessage("");
          syncAttachments([]);
        }}
      >
        <Attachments
          attachments={attachments}
          onAttachmentsChange={syncAttachments}
          accept="*/*"
          multiple
        >
          {attachments.length > 0 ? (
            <AttachmentList className="px-3 pt-3">
              {attachments.map((item) => (
                <Attachment
                  key={attachmentKey(item)}
                  variant="pill"
                  attachment={item}
                  onRemove={() => removeAttachment(item)}
                />
              ))}
            </AttachmentList>
          ) : null}
          <PromptInputTextarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message with attachments…"
          />
          <PromptInputActions>
            <PromptInputActionGroup>
              <PromptInputAction asChild>
                <AttachmentTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 cursor-pointer rounded-full border-none bg-transparent text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
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
              <Button
                type="submit"
                className="h-9 rounded-full px-4 text-sm font-medium"
              >
                Send
              </Button>
            </PromptInputActionGroup>
          </PromptInputActions>
        </Attachments>
      </PromptInput>
    </div>
  );
}

export default AttachmentsWithPromptInput;
