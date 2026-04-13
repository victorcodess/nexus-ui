"use client";

import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageMarkdown,
  MessageStack,
} from "@/components/nexus-ui/message";

const imgUser = "/assets/user-avatar.avif";
const imgAssistant = "/assets/nexus-avatar.png";

const MessageWithAvatar = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-6">
      <Message from="user">
        <MessageStack>
          <MessageContent>
            <MessageMarkdown>Hello — can you help me draft an email?</MessageMarkdown>
          </MessageContent>
        </MessageStack>
        <MessageAvatar src={imgUser} alt="" fallback="U" className="border border-accent" />
      </Message>

      <Message from="assistant">
        <MessageAvatar src={imgAssistant} alt="" fallback="A" className="border border-accent" />
        <MessageStack>
          <MessageContent>
            <MessageMarkdown>
              Of course. What tone do you want: formal or friendly?
            </MessageMarkdown>
          </MessageContent>
        </MessageStack>
      </Message>
    </div>
  );
};

export default MessageWithAvatar;
