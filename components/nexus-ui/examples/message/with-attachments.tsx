"use client";

import { Attachment, AttachmentList, type AttachmentMeta } from "@/components/nexus-ui/attachments";
import {
  Message,
  MessageContent,
  MessageMarkdown,
  MessageStack,
} from "@/components/nexus-ui/message";

const previewUrl =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop";

const items: AttachmentMeta[] = [
  {
    type: "image",
    name: "landscape.jpg",
    url: previewUrl,
    mimeType: "image/jpeg",
  },
  { type: "file", name: "notes.txt", mimeType: "text/plain" },
];

const MessageWithAttachments = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-6">
      <Message from="user">
        <MessageStack>
          <AttachmentList className="justify-end p-0 gap-2">
            {items.map((item) => (
              <Attachment
                key={`${item.name}-${item.type}-${item.mimeType}`}
                variant="compact"
                attachment={item}
                readOnly
                className="size-25 rounded-[10px]"
              />
            ))}
          </AttachmentList>
          <MessageContent>
            <MessageMarkdown>What do you see in these files?</MessageMarkdown>
          </MessageContent>
        </MessageStack>
      </Message>

      <Message from="assistant">
        <MessageStack>
          <MessageContent>
            <MessageMarkdown>
              I can see an image attachment and a text file named notes.txt.
            </MessageMarkdown>
          </MessageContent>
        </MessageStack>
      </Message>
    </div>
  );
};

export default MessageWithAttachments;
