"use client";

import { toast } from "sonner";
import { Toaster } from "@/components/nexus-ui/toaster";
import { Button } from "@/components/ui/button";

const ToasterDefault = () => {
  return (
    <div className="flex min-h-24 w-full items-center justify-center">
      <Button type="button" onClick={() => toast.success("Toast sent successfully")}>
        Show toast
      </Button>
      <Toaster />
    </div>
  );
};

export default ToasterDefault;
