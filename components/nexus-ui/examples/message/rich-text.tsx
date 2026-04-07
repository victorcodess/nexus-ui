"use client";

import {
  Message,
  MessageContent,
  MessageMarkdown,
  MessageStack,
} from "@/components/nexus-ui/message";

const markdown = `## Quick tips

You can use **bold**, *italic*, inline \`code\`, and [links](https://example.com).

### Lists and structure

Unordered:
- Bullet one
- Bullet two

Ordered:
1. First step
2. Second step
3. Third step

### Comparison table

| Feature | Notes |
| ------- | ----- |
| Tables | GFM-style pipes |
| Code | Fenced blocks and \`inline\` |

\`\`\`typescript
const answer = 42;

function greet(name: string) {
  return \`Hello, \${name}\`;
}
\`\`\`
`;

const MessageRichText = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-6">
      <Message from="user">
        <MessageStack>
          <MessageContent>
            <MessageMarkdown>Show me markdown features.</MessageMarkdown>
          </MessageContent>
        </MessageStack>
      </Message>

      <Message from="assistant">
        <MessageStack>
          <MessageContent>
            <MessageMarkdown >{markdown}</MessageMarkdown>
          </MessageContent>
        </MessageStack>
      </Message>
    </div>
  );
};

export default MessageRichText;
