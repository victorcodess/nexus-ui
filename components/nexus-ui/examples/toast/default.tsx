"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/nexus-ui/toast";

const ToastDefault = () => {
  return (
    <div className="flex min-h-24 w-full items-center justify-center">
      <Button type="button" onClick={() => toast.success("Toast sent successfully")}>
        Show toast
      </Button>
      <Toast />
    </div>
  );
};

export default ToastDefault;
