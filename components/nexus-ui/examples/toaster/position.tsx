"use client";

import { toast, Toaster } from "@/components/nexus-ui/toaster";
import { Button } from "@/components/ui/button";

const ToasterPosition = () => {
  return (
    <div className="flex min-h-24 w-full flex-wrap items-center justify-center gap-2">
      <Button
        variant="secondary"
        size="default"
        type="button"
        onClick={() =>
          toast.default("Sync started.", {
            description: "Top-left toast for global workspace sync updates.",
            position: "top-left",
          })
        }
      >
        Top Left
      </Button>
      <Button
        variant="secondary"
        size="default"
        type="button"
        onClick={() =>
          toast.default("Agent requested approval.", {
            description: "Top-center toast for high-priority permission prompts.",
            position: "top-center",
          })
        }
      >
        Top Center
      </Button>
      <Button
        variant="secondary"
        size="default"
        type="button"
        onClick={() =>
          toast.default("Update available.", {
            description: "Top-right toast for product announcements and releases.",
            position: "top-right",
          })
        }
      >
        Top Right
      </Button>
      <Button
        variant="secondary"
        size="default"
        type="button"
        onClick={() =>
          toast.default("File indexed.", {
            description: "Bottom-left toast for background indexing events.",
            position: "bottom-left",
          })
        }
      >
        Bottom Left
      </Button>
      <Button
        variant="secondary"
        size="default"
        type="button"
        onClick={() =>
          toast.default("Draft saved.", {
            description: "Bottom-center toast for editor autosave confirmations.",
            position: "bottom-center",
          })
        }
      >
        Bottom Center
      </Button>
      <Button
        variant="secondary"
        size="default"
        type="button"
        onClick={() =>
          toast.default("Prompt copied.", {
            description: "Bottom-right toast for quick local action feedback.",
            position: "bottom-right",
          })
        }
      >
        Bottom Right
      </Button>
      <Toaster />
    </div>
  );
};

export default ToasterPosition;
