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
import { Button } from "@/components/ui/button";

type ToastVariant =
  | "default"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "loading";

type ToastAction = {
  label: React.ReactNode;
  onClick?: () => void;
};

type ToastContent = {
  title: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  icon?: React.ReactNode | null;
  action?: ToastAction;
  cancel?: ToastAction;
} & Omit<
  ExternalToast,
  "icon" | "classNames" | "unstyled" | "action" | "cancel"
>;

const variantIconMap: Partial<Record<ToastVariant, React.ReactNode>> = {
  success: (
    <HugeiconsIcon
      icon={CheckmarkCircle01Icon}
      strokeWidth={2}
      className="size-4.5"
    />
  ),
  info: (
    <HugeiconsIcon
      icon={InformationCircleIcon}
      strokeWidth={2}
      className="size-4.5"
    />
  ),
  warning: (
    <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-4.5" />
  ),
  error: (
    <HugeiconsIcon icon={OctagonXIcon} strokeWidth={2} className="size-4.5" />
  ),
  loading: (
    <HugeiconsIcon
      icon={Loading03Icon}
      strokeWidth={2}
      className="size-4.5 animate-spin"
    />
  ),
};

const toast = {
  custom: (content: ToastContent) => {
    const {
      title,
      description,
      variant,
      icon,
      action,
      cancel,
      dismissible,
      closeButton,
      ...sonnerOptions
    } = content;
    return sonnerToast.custom(
      (id) => (
        <ToastCard
          id={id}
          title={title}
          description={description}
          variant={variant}
          icon={icon}
          action={action}
          cancel={cancel}
          dismissible={dismissible}
          closeButton={closeButton}
        />
      ),
      {
        ...sonnerOptions,
        dismissible,
        closeButton,
      },
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
  icon,
  action,
  cancel,
  dismissible = true,
  closeButton = true,
  variant = "default",
}: ToastContent & { id: string | number }) {
  const resolvedIcon = icon === null ? null : (icon ?? variantIconMap[variant]);
  const canDismiss = dismissible !== false;

  return (
    <div
      className={cn(
        "relative flex w-full items-start justify-between gap-2 rounded-lg px-4 py-3 shadow-[0_8px_10px_rgb(0,0,0,0.02)] transition-colors lg:w-90 xl:w-120",
        "border border-(--toast-color)/5 bg-(--toast-bg) text-(--toast-color)",
        "dark:bg-(--toast-bg)",
        "[--toast-bg:var(--popover)] [--toast-color:var(--popover-foreground)]",
        "data-[variant=default]:[--toast-bg:var(--popover)] data-[variant=default]:[--toast-color:var(--primary)]",
        "data-[variant=success]:[--toast-bg:#F0FDF4] data-[variant=success]:[--toast-color:#16A34A] data-[variant=success]:dark:[--toast-bg:#17221C] data-[variant=success]:dark:[--toast-color:#15803D]",
        "data-[variant=info]:[--toast-bg:#EFF6FF] data-[variant=info]:[--toast-color:#2563EB] data-[variant=info]:dark:[--toast-bg:#181D28] data-[variant=info]:dark:[--toast-color:#1D4ED8]",
        "data-[variant=warning]:[--toast-bg:#FEFCE8] data-[variant=warning]:[--toast-color:#CA8A04] data-[variant=warning]:dark:[--toast-bg:#252015] data-[variant=warning]:dark:[--toast-color:#CA8A04]",
        "data-[variant=error]:[--toast-bg:#FEF2F2] data-[variant=error]:[--toast-color:#DC2626] data-[variant=error]:dark:[--toast-bg:#271818] data-[variant=error]:dark:[--toast-color:#B91C1C]",
      )}
      data-variant={variant}
    >
      {resolvedIcon ? (
        <div className="flex size-6 shrink-0 items-center justify-center text-(--toast-color)">
          {resolvedIcon}
        </div>
      ) : null}

      <div className="flex w-full flex-col gap-0.25">
        <span className="text-sm leading-6 font-medium text-(--toast-color)">
          {title}
        </span>
        {description ? (
          <div
            className="mt-0 text-sm leading-5.5 font-[350] text-(--toast-color) data-[variant=default]:text-muted-foreground"
            data-variant={variant}
          >
            {description}
          </div>
        ) : null}

        <div className="flex items-center gap-1.5">
          {action ? (
            <Button
              type="button"
              variant="default"
              size="sm"
              className={cn(
                "mt-2 inline-flex w-fit cursor-pointer items-center justify-center rounded-full text-[13px] font-[450] transition-colors",
                "bg-(--toast-color) text-(--toast-bg) hover:bg-(--toast-color)/90 hover:text-(--toast-bg)",
              )}
              onClick={() => {
                action.onClick?.();
                if (canDismiss) sonnerToast.dismiss(id);
              }}
            >
              {action.label}
            </Button>
          ) : null}

          {cancel ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "mt-2 inline-flex w-fit cursor-pointer items-center justify-center rounded-full text-[13px] font-[450] transition-colors",
                "border border-(--toast-color)/10 text-(--toast-color) hover:bg-(--toast-color)/5 dark:hover:bg-(--toast-color)/10",
              )}
              onClick={() => {
                cancel.onClick?.();
                if (canDismiss) sonnerToast.dismiss(id);
              }}
            >
              {cancel.label}
            </Button>
          ) : null}
        </div>
      </div>

      {canDismiss && closeButton !== false ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close notification"
          className={cn(
            "inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-(--toast-color)/70 transition-colors",
            "hover:bg-(--toast-color)/10 hover:text-(--toast-color) focus-visible:ring-2 focus-visible:ring-(--toast-color)/35 dark:hover:bg-(--toast-color)/10 dark:hover:text-(--toast-color)",
          )}
          onClick={() => sonnerToast.dismiss(id)}
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            strokeWidth={2}
            className="size-4"
          />
        </Button>
      ) : null}
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
