"use client";

import {
  Message,
  MessageContent,
  MessageMarkdown,
  MessageStack,
} from "@/components/nexus-ui/message";

const MessageDefault = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-6">
      <Message from="user">
        <MessageStack>
          <MessageContent>
            <MessageMarkdown>What is the capital of France?</MessageMarkdown>
          </MessageContent>
        </MessageStack>
      </Message>

      <Message from="assistant">
        <MessageStack>
          <MessageContent>
            <MessageMarkdown>The capital of France is Paris.</MessageMarkdown>
          </MessageContent>
        </MessageStack>
      </Message>
    </div>
  );
};

export default MessageDefault;
