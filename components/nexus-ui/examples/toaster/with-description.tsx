"use client";

import { toast, Toaster } from "@/components/nexus-ui/toaster";
import { Button } from "@/components/ui/button";

const ToasterWithDescription = () => {
  return (
    <div className="flex min-h-24 w-full items-center justify-center">
      <Button
        variant="secondary"
        size="default"
        type="button"
        onClick={() =>
          toast.default("Conversation exported.", {
            description: "Downloaded `session-2026-05-13.json` with messages and citations.",
          })
        }
      >
        Show toast
      </Button>
      <Toaster />
    </div>
  );
};

export default ToasterWithDescription;
