"use client";

import { toast, Toaster } from "@/components/nexus-ui/toaster";
import { Button } from "@/components/ui/button";

const ToasterDefault = () => {
  return (
    <div className="flex min-h-24 w-full items-center justify-center">
      <Button
        variant="secondary"
        size="default"
        type="button"
        onClick={() =>
          toast.success("Toast sent successfully", {
            duration: Infinity,
            description: "Your request failed. Try again in a few seconds.",
            action: {
              label: "Retry",
            },
          })
        }
      >
        Show toast
      </Button>
      <Toaster />
    </div>
  );
};

export default ToasterDefault;
