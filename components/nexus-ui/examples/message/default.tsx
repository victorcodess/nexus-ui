"use client";

import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  RepeatIcon,
  Edit04Icon,
} from "@hugeicons/core-free-icons";
import { Streamdown } from "streamdown";

const MessageDefault = () => {
  const responseOne = `## Hello World!
          
This message supports **bold text**, *italics*, and other Markdown features:
        
- Bullet points
- Code blocks
- [Links](https://example.com)
        
\`\`\`js
// Even code with syntax highlighting
const response = \`
function hello() {
  return "world";
}
\`\`\`
`;

  const responseTwo = `Borem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.

Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. 
`;
  return (
    <div className="flex w-full flex-col items-center justify-center gap-6">
      <div className="flex w-full justify-end">
        <div className="flex w-auto max-w-[90%] items-start gap-2">
          <div className="flex w-auto flex-col gap-2">
            <div className="min-h-10 rounded-[20px] bg-gray-100 px-4 py-2 text-sm leading-6 text-gray-900">
              What is life?
            </div>

            <div className="flex w-full justify-end">
              <div className="flex gap-1">
                <Button
                  type="button"
                  className="size-8 cursor-pointer rounded-full bg-transparent text-gray-500 transition-all hover:bg-gray-100 active:scale-97 dark:text-white dark:hover:bg-gray-700"
                >
                  <HugeiconsIcon
                    icon={Edit04Icon}
                    strokeWidth={2.0}
                    className="size-4"
                  />
                </Button>
                <Button
                  type="button"
                  className="size-8 cursor-pointer rounded-full bg-transparent text-gray-500 transition-all hover:bg-gray-100 active:scale-97 dark:text-white dark:hover:bg-gray-700"
                >
                  <HugeiconsIcon
                    icon={Copy01Icon}
                    strokeWidth={2.0}
                    className="size-4"
                  />
                </Button>
              </div>
            </div>
          </div>

          <div className="size-8 shrink-0 rounded-full bg-gray-200"></div>
        </div>
      </div>

      <div className="flex w-full justify-start">
        <div className="flex w-auto max-w-[90%] items-start gap-2">
          <div className="size-8 shrink-0 rounded-full bg-gray-200"></div>

          <div className="flex w-auto flex-col gap-2">
            <div className="min-h-10 rounded-[20px] bg-transparent px-2 text-sm leading-6 text-gray-900">
              <Streamdown className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                {`Borem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.

Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. 
`}
              </Streamdown>
            </div>

            <div className="flex w-full justify-start">
              <div className="flex gap-1">
                <Button
                  type="button"
                  className="size-8 cursor-pointer rounded-full bg-transparent text-gray-500 transition-all hover:bg-gray-100 active:scale-97 dark:text-white dark:hover:bg-gray-700"
                >
                  <HugeiconsIcon
                    icon={Copy01Icon}
                    strokeWidth={2.0}
                    className="size-4"
                  />
                </Button>
                <Button
                  type="button"
                  className="size-8 cursor-pointer rounded-full bg-transparent text-gray-500 transition-all hover:bg-gray-100 active:scale-97 dark:text-white dark:hover:bg-gray-700"
                >
                  <HugeiconsIcon
                    icon={ThumbsUpIcon}
                    strokeWidth={2.0}
                    className="size-4"
                  />
                </Button>
                <Button
                  type="button"
                  className="size-8 cursor-pointer rounded-full bg-transparent text-gray-500 transition-all hover:bg-gray-100 active:scale-97 dark:text-white dark:hover:bg-gray-700"
                >
                  <HugeiconsIcon
                    icon={ThumbsDownIcon}
                    strokeWidth={2.0}
                    className="size-4"
                  />
                </Button>
                <Button
                  type="button"
                  className="size-8 cursor-pointer rounded-full bg-transparent text-gray-500 transition-all hover:bg-gray-100 active:scale-97 dark:text-white dark:hover:bg-gray-700"
                >
                  <HugeiconsIcon
                    icon={RepeatIcon}
                    strokeWidth={2.0}
                    className="size-4"
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDefault;
