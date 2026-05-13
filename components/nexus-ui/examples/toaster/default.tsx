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
          toast.default("Nexus UI is a component library built on top of shadcn/ui.", {
            duration: Infinity,
            description: "Rather than retrofitting general-purpose components, every primitive is crafted around the patterns AI products demand.",
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
