import NexusIcon from "@/components/layout/svgs/nexus";
import ChatgptIcon from "@/components/layout/svgs/chatgpt";
import ClaudeIcon from "@/components/layout/svgs/claude";
import GeminiIcon from "@/components/layout/svgs/gemini";
import ChatgptInput from "@/components/nexus-ui/examples/chatgpt-input";
import NexusInput from "@/components/nexus-ui/examples/nexus-input";
import ClaudeInput from "@/components/nexus-ui/examples/claude-input";
import GeminiInput from "@/components/nexus-ui/examples/gemini-input";
import V0Input from "@/components/nexus-ui/examples/v0-input";
import V0Icon from "@/components/layout/svgs/v0";

export type TabKey = "nexus" | "gemini" | "chatgpt" | "claude" | "v0";

export const tabs: { key: TabKey; label: string; icon: typeof NexusIcon }[] = [
  { key: "nexus", label: "Nexus", icon: NexusIcon },
  { key: "gemini", label: "Gemini", icon: GeminiIcon },
  { key: "chatgpt", label: "ChatGPT", icon: ChatgptIcon },
  { key: "claude", label: "Claude", icon: ClaudeIcon },
  { key: "v0", label: "v0", icon: V0Icon },
];

export const inputComponents: Record<TabKey, React.ReactNode> = {
  nexus: <NexusInput />,
  gemini: <GeminiInput />,
  chatgpt: <ChatgptInput />,
  claude: <ClaudeInput />,
  v0: <V0Input />,
};

export const codeSnippets: Record<TabKey, string> = {
  nexus: `import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { ArrowUp, Paperclip } from "lucide-react";

const NexusInput = () => {
  return (
    <PromptInput>
      <PromptInputTextarea />
      <PromptInputActions>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer gap-1 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-[#171717] hover:bg-[#E5E5E5] dark:bg-[#404040] dark:text-white">
              <Paperclip />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>

        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer gap-1 rounded-full bg-[#404040] text-[13px] leading-6 font-normal text-white hover:bg-[#E5E5E5] dark:bg-[#404040] dark:text-white">
              <ArrowUp />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};

export default NexusInput;`,

  gemini: `import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import {
  GeminiAdd,
  GeminiPageInfo,
  GeminiMic,
  GeminiCaret,
} from "@/components/layout/svgs/gemini-icons";

const GeminiInput = () => {
  return (
    <PromptInput className="rounded-[32px] p-3 shadow-none dark:border-none">
      <PromptInputTextarea
        placeholder="Ask Gemini 3"
        className="min-h-12 px-3 py-2.25 text-base! placeholder:text-base"
      />
      <PromptInputActions className="px-0 pt-2 pb-0">
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-10 cursor-pointer rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-[#E5E5E5] dark:text-white dark:hover:bg-[#404040]">
              <GeminiAdd className="size-5 text-[#5D5D5D]" />
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button className="size-10 cursor-pointer gap-1 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-[#E5E5E5] dark:text-white dark:hover:bg-[#404040]">
              <GeminiPageInfo className="size-5 text-[#5D5D5D]" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="h-10 cursor-pointer gap-1.75 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-[#E5E5E5] dark:text-white dark:hover:bg-[#404040]">
              <span>Fast</span>
              <GeminiCaret className="-mb-0.5 size-5 text-[#5D5D5D]" />
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button className="size-10 cursor-pointer gap-1 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-[#E5E5E5] dark:text-white dark:hover:bg-[#404040]">
              <GeminiMic className="size-5 text-[#5D5D5D]" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};

export default GeminiInput;`,

  chatgpt: `import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { AudioLines, Globe, Paperclip } from "lucide-react";

const ChatgptInput = () => {
  return (
    <PromptInput className="rounded-[28px]">
      <PromptInputTextarea
        placeholder="Ask anything"
        className="min-h-16 px-6"
      />
      <PromptInputActions className="px-3 py-2.5">
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="w-9 cursor-pointer gap-1 rounded-full border border-border-primary bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-[#E5E5E5] sm:w-fit dark:bg-[#404040] dark:text-white">
              <Paperclip className="size-4 text-[#5D5D5D]" />
              <span className="hidden sm:inline">Attach</span>
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button className="w-9 cursor-pointer gap-1 rounded-full border border-border-primary bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-[#E5E5E5] sm:w-fit dark:bg-[#404040] dark:text-white">
              <Globe className="size-4 text-[#5D5D5D]" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="w-9 cursor-pointer gap-1 rounded-full bg-[#E5E5E5] text-[13px] leading-6 font-normal text-[#171717] hover:bg-[#E5E5E5] sm:w-fit dark:bg-[#404040] dark:text-white">
              <AudioLines className="size-4" />
              <span className="hidden sm:inline">Voice</span>
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};

export default ChatgptInput;`,
  
    claude: `import * as React from "react";

  import { Button } from "@/components/ui/button";
  import PromptInput, {
    PromptInputActions,
    PromptInputAction,
    PromptInputActionGroup,
    PromptInputTextarea,
  } from "@/components/nexus-ui/prompt-input";
  import { ArrowUp, Paperclip } from "lucide-react";

  const ClaudeInput = () => {
    return (
      <PromptInput className="rounded-[24px] shadow-none">
        <PromptInputTextarea
          placeholder="Reply to Claude..."
          className="min-h-12 px-5 py-3"
        />
        <PromptInputActions className="px-3 py-2">
          <PromptInputActionGroup>
            <PromptInputAction asChild>
              <Button className="size-8 cursor-pointer gap-1 rounded-xl border-none bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-[#E5E5E5] dark:hover:bg-[#404040] dark:text-white">
                <Paperclip className="size-4" />
              </Button>
            </PromptInputAction>
          </PromptInputActionGroup>

          <PromptInputActionGroup>
            <PromptInputAction asChild>
              <Button className="size-8 cursor-pointer gap-1 rounded-xl bg-[#da7756] text-[13px] leading-6 font-normal text-white hover:bg-[#c46a4d]">
                <ArrowUp className="size-4" />
              </Button>
            </PromptInputAction>
          </PromptInputActionGroup>
        </PromptInputActions>
      </PromptInput>
    );
  };

  export default ClaudeInput;
  `,

  v0: `import * as React from "react";

  import { Button } from "@/components/ui/button";
  import PromptInput, {
    PromptInputActions,
    PromptInputAction,
    PromptInputActionGroup,
    PromptInputTextarea,
  } from "@/components/nexus-ui/prompt-input";
  import { ArrowUp, Paperclip } from "lucide-react";
  import V0Icon from "@/components/layout/svgs/v0";

  const V0Input = () => {
    return (
      <PromptInput className="rounded-[24px] shadow-none">
        <PromptInputTextarea
          placeholder="Reply to V0..."
          className="min-h-12 px-5 py-3"
        />
        <PromptInputActions className="px-3 py-2">
          <PromptInputActionGroup>
            <PromptInputAction asChild>
              <Button className="size-8 cursor-pointer gap-1 rounded-xl border-none bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-[#E5E5E5] dark:hover:bg-[#404040] dark:text-white">
                <Paperclip className="size-4" />
              </Button>
            </PromptInputAction>
          </PromptInputActionGroup>

          <PromptInputActionGroup>
            <PromptInputAction asChild>
              <Button className="size-8 cursor-pointer gap-1 rounded-xl bg-[#da7756] text-[13px] leading-6 font-normal text-white hover:bg-[#c46a4d]">
                <ArrowUp className="size-4" />
              </Button>
            </PromptInputAction>
          </PromptInputActionGroup>
        </PromptInputActions>
      </PromptInput>
    );
  };

  export default V0Input;
  `,
};
