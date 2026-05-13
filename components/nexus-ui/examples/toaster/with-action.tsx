"use client";

import { toast, Toaster } from "@/components/nexus-ui/toaster";
import { Button } from "@/components/ui/button";

const ToasterWithAction = () => {
  const toasterId = "toaster-example-with-action";

  return (
    <div className="flex min-h-24 w-full items-center justify-center">
      <Button
        variant="secondary"
        size="default"
        type="button"
        onClick={() =>
          toast.default("Prompt preset updated.", {
            description:
              "Saved `research-mode` as your default assistant preset.",
            toasterId,
            action: {
              label: "Revert",
              onClick: () => console.log("Preset reverted"),
            },
          })
        }
      >
        Show toast
      </Button>
      <Toaster id={toasterId} />
    </div>
  );
};

export default ToasterWithAction;
