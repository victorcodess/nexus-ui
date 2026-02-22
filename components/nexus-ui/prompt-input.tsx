import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollViewport } from "@/components/ui/scroll-area";

import { AudioLines, Globe, Paperclip } from "lucide-react";

const PromptInput = () => {
  return (
    <div className="flex h-auto w-full flex-col gap-0 rounded-[28px] border border-border-primary bg-surface-elevated shadow-sm">
      <ScrollArea className="max-h-40 rounded-t-[28px]">
        <ScrollViewport>
          <Textarea
            className="min-h-16 w-full resize-none rounded-t-[28px] rounded-b-none border-0 bg-transparent! px-6 py-4 text-base leading-6 font-normal text-[#171717] shadow-none outline-none placeholder:text-[#737373] focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Ask anything"
          />
        </ScrollViewport>
      </ScrollArea>

      <div className="flex w-full shrink-0 items-center justify-between rounded-t-none rounded-b-[28px] px-3 py-2.5">
        <div className="flex gap-2">
          <Button className="w-9 sm:w-fit cursor-pointer gap-1 rounded-full border border-border-primary bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-[#E5E5E5] dark:bg-[#404040] dark:text-white">
            <Paperclip className="size-4 text-[#5D5D5D]" />
            <span className="hidden sm:inline">Attach</span>
          </Button>
          <Button className="w-9 sm:w-fit cursor-pointer gap-1 rounded-full border border-border-primary bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-[#E5E5E5] dark:bg-[#404040] dark:text-white">
            <Globe className="size-4 text-[#5D5D5D]" />
            <span className="hidden sm:inline">Search</span>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button className="w-9 sm:w-fit cursor-pointer gap-1 rounded-full bg-[#E5E5E5] text-[13px] leading-6 font-normal text-[#171717] hover:bg-[#E5E5E5] dark:bg-[#404040] dark:text-white">
            <AudioLines className="size-4" />
            <span className="hidden sm:inline">Voice</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
