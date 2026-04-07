"use client";

import {
  Message,
  MessageAvatar,
  MessageAvatarFallback,
  MessageAvatarImage,
  MessageContent,
  MessageMarkdown,
  MessageStack,
} from "@/components/nexus-ui/message";

const imgUser =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop";
const imgAssistant =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop";

const MessageWithAvatar = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-6">
      <Message from="user">
        <MessageStack>
          <MessageContent>
            <MessageMarkdown>Hello — can you help me draft an email?</MessageMarkdown>
          </MessageContent>
        </MessageStack>
        <MessageAvatar>
          <MessageAvatarImage src={imgUser} alt="" />
          <MessageAvatarFallback>U</MessageAvatarFallback>
        </MessageAvatar>
      </Message>

      <Message from="assistant">
        <MessageAvatar>
          <MessageAvatarImage src={imgAssistant} alt="" />
          <MessageAvatarFallback>A</MessageAvatarFallback>
        </MessageAvatar>
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
