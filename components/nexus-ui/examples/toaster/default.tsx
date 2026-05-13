"use client";

import { toast, Toaster } from "@/components/nexus-ui/toaster";
import { Button } from "@/components/ui/button";

const ToasterDefault = () => {
  const toasterId = "toaster-example-default";

  return (
    <div className="flex min-h-24 w-full items-center justify-center">
      <Button
        variant="secondary"
        size="default"
        type="button"
        onClick={() =>
          toast.default("Message copied to clipboard.", {
            toasterId,
          })
        }
      >
        Show toast
      </Button>
      <Toaster id={toasterId} />
    </div>
  );
};

export default ToasterDefault;
