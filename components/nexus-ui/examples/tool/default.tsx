import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDown01Icon,
  CheckmarkCircle01Icon,
  Loading03Icon,
  Clock01Icon,
  CancelCircleIcon,
  ToolsIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockGroup,
  CodeBlockIcon,
  CodeblockShiki,
  CodeBlockCopyButton,
} from "../../codeblock-new";

function ToolDefault() {
  const colorMap = {
    pending: { bg: "var(--color-gray-100)", fg: "var(--color-gray-600)" },
    ready: { bg: "var(--color-orange-100)", fg: "var(--color-orange-600)" },
    running: { bg: "var(--color-blue-100)", fg: "var(--color-blue-600)" },
    success: { bg: "var(--color-green-100)", fg: "var(--color-green-600)" },
    error: { bg: "var(--color-red-100)", fg: "var(--color-red-600)" },
  } as const;
  const colors = colorMap["success"];
  return (
    <div className="">
      <Collapsible
        className="not-prose w-100 border border-accent data-[state=closed]:rounded-3xl data-[state=open]:rounded-3xl"
        style={
          {
            "--tool-color": colors.fg,
            "--tool-bg": colors.bg,
          } as object
        }
        // open
      >
        <CollapsibleTrigger className="flex h-10 w-full cursor-pointer items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={CheckmarkCircle01Icon}
              strokeWidth={2}
              className="size-4 text-(--tool-color)"
            />
            <span className="text-sm leading-6 font-[450] text-primary">
              get_weather
            </span>

            <Badge className="h-6 bg-(--tool-bg)/80 font-[450] text-(--tool-color) dark:bg-(--tool-color)/10 dark:text-(--tool-color)">
              Success
            </Badge>
          </div>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            strokeWidth={1.75}
            className="size-4"
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-6 p-3 pt-4">
          <div className="flex flex-col gap-3">
            <span className="text-xs leading-4 font-[450] text-muted-foreground uppercase">
              Input
            </span>

            <CodeBlock keepBackground>
              <CodeBlockContent>
                <CodeblockShiki language="json">
                  {`{
  "city": "Paris",
  "unit": "celsius"
}`}
                </CodeblockShiki>
              </CodeBlockContent>
            </CodeBlock>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs leading-4 font-[450] text-muted-foreground uppercase">
              Output
            </span>

            <CodeBlock keepBackground>
              <CodeBlockContent>
                <CodeblockShiki language="json">
                  {`{
  "city": "Paris",
  "unit": "celsius",
  "temperature": 22,
  "condition": "sunny"
}`}
                </CodeblockShiki>
              </CodeBlockContent>
            </CodeBlock>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default ToolDefault;
