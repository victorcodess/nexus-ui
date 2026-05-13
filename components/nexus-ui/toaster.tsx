"use client";

import {
  Alert02Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
  Loading03Icon,
  OctagonXIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type * as React from "react";
import { useTheme } from "next-themes";
import {
  Toaster as Sonner,
  toast as sonnerToast,
  type ExternalToast,
  type ToasterProps,
} from "sonner";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "info" | "warning" | "error" | "loading";

type ToastAction = {
  label: React.ReactNode;
  onClick?: () => void;
};

type ToastContent = {
  title: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  action?: ToastAction;
} & Omit<ExternalToast, "id" | "icon" | "classNames" | "unstyled" | "action">;

const variantIconMap: Partial<Record<ToastVariant, React.ReactNode>> = {
  success: <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="size-5" />,
  info: <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-5" />,
  warning: <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-5" />,
  error: <HugeiconsIcon icon={OctagonXIcon} strokeWidth={2} className="size-5" />,
  loading: <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-5 animate-spin" />,
};

const toast = {
  custom: (content: ToastContent) => {
    const { title, description, variant, action, ...sonnerOptions } = content;
    return sonnerToast.custom(
      (id) => (
        <ToastCard
          id={id}
          title={title}
          description={description}
          variant={variant}
          action={action}
        />
      ),
      sonnerOptions,
    );
  },
  default: (
    title: React.ReactNode,
    options?: Omit<ToastContent, "title" | "variant">,
  ) => toast.custom({ title, variant: "default", ...options }),
  success: (
    title: React.ReactNode,
    options?: Omit<ToastContent, "title" | "variant">,
  ) => toast.custom({ title, variant: "success", ...options }),
  info: (
    title: React.ReactNode,
    options?: Omit<ToastContent, "title" | "variant">,
  ) => toast.custom({ title, variant: "info", ...options }),
  warning: (
    title: React.ReactNode,
    options?: Omit<ToastContent, "title" | "variant">,
  ) => toast.custom({ title, variant: "warning", ...options }),
  error: (
    title: React.ReactNode,
    options?: Omit<ToastContent, "title" | "variant">,
  ) => toast.custom({ title, variant: "error", ...options }),
  loading: (
    title: React.ReactNode,
    options?: Omit<ToastContent, "title" | "variant">,
  ) => toast.custom({ title, variant: "loading", ...options }),
  dismiss: sonnerToast.dismiss,
};

function ToastCard({
  id,
  title,
  description,
  action,
  variant = "default",
}: ToastContent & { id: string | number }) {
  const icon = variantIconMap[variant];

  return (
    <div
      className={cn(
        "relative flex w-full items-start gap-3 rounded-[12px] border px-4 py-3.5 pr-10 shadow-sm transition-colors",
        "border-(--toast-border) bg-(--toast-bg) text-(--toast-color)",
        "dark:border-(--toast-color)/35 dark:bg-(--toast-color)/10",
        "[--toast-bg:var(--popover)] [--toast-color:var(--popover-foreground)] [--toast-border:var(--border)]",
        "data-[variant=default]:[--toast-bg:var(--popover)] data-[variant=default]:[--toast-color:var(--popover-foreground)] data-[variant=default]:[--toast-border:var(--border)]",
        "data-[variant=success]:[--toast-bg:#F0FDF4] data-[variant=success]:[--toast-color:#16A34A] data-[variant=success]:[--toast-border:#BBF7D0]",
        "data-[variant=info]:[--toast-bg:#EFF6FF] data-[variant=info]:[--toast-color:#2563EB] data-[variant=info]:[--toast-border:#BFDBFE]",
        "data-[variant=warning]:[--toast-bg:#FEFCE8] data-[variant=warning]:[--toast-color:#CA8A04] data-[variant=warning]:[--toast-border:#FEF08A]",
        "data-[variant=error]:[--toast-bg:#FEF2F2] data-[variant=error]:[--toast-color:#DC2626] data-[variant=error]:[--toast-border:#FECACA]",
      )}
      data-variant={variant}
    >
      {icon ? <div className="mt-0.5 shrink-0 text-(--toast-color)">{icon}</div> : null}

      <div className="min-w-0 flex-1">
        <div className="text-sm leading-5 font-medium text-(--toast-color)">{title}</div>
        {description ? (
          <div className="mt-1 text-[13px] leading-5 text-(--toast-color)">{description}</div>
        ) : null}

        {action ? (
          <button
            type="button"
            className={cn(
              "mt-3 inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium transition-colors",
              "border-(--toast-color)/35 text-(--toast-color) hover:bg-(--toast-color)/12",
            )}
            onClick={() => {
              action.onClick?.();
              sonnerToast.dismiss(id);
            }}
          >
            {action.label}
          </button>
        ) : null}
      </div>

      <button
        type="button"
        aria-label="Close notification"
        className={cn(
          "absolute top-2 right-2 inline-flex size-6 items-center justify-center rounded-md text-(--toast-color) transition-colors",
          "hover:bg-(--toast-color)/12 focus-visible:ring-2 focus-visible:ring-(--toast-color)/35",
        )}
        onClick={() => sonnerToast.dismiss(id)}
      >
        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4" />
      </button>
    </div>
  );
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{ unstyled: true }}
      {...props}
    />
  );
};

export { toast, Toaster };
