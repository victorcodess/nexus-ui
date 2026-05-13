"use client";

import { toast, Toaster } from "@/components/nexus-ui/toaster";
import { Button } from "@/components/ui/button";

const ToasterVariantsRow = () => {
  return (
    <div className="flex min-h-24 w-full flex-wrap items-center justify-center gap-2">
      <Button
        variant="secondary"
        size="default"
        type="button"
        onClick={() =>
          toast.success("Deploy completed.", {
            description: "Your chat assistant changes are now live in production.",
          })
        }
      >
        Success
      </Button>
      <Button
        variant="secondary"
        size="default"
        type="button"
        onClick={() =>
          toast.info("Model switched.", {
            description: "Responses will now use `gpt-5.5-medium` for this thread.",
          })
        }
      >
        Info
      </Button>
      <Button
        variant="secondary"
        size="default"
        type="button"
        onClick={() =>
          toast.warning("Context window almost full.", {
            description: "Older messages may be truncated in the next response.",
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="secondary"
        size="default"
        type="button"
        onClick={() =>
          toast.error("Tool call failed.", {
            description: "The web search tool timed out. Try again in a moment.",
          })
        }
      >
        Error
      </Button>
      <Button
        variant="secondary"
        size="default"
        type="button"
        onClick={() =>
          toast.loading("Generating answer...", {
            description: "The assistant is analyzing files and drafting a response.",
          })
        }
      >
        Loading
      </Button>
      <Toaster />
    </div>
  );
};

export default ToasterVariantsRow;
