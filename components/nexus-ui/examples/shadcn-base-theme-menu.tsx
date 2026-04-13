"use client";

import * as React from "react";
import {
  ArrowDown01Icon,
  Moon02Icon,
  PaintBoardIcon,
  ShuffleIcon,
  ShuffleSquareIcon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  SHADCN_BASE_THEME_DARK_VARS,
  SHADCN_BASE_THEME_LIGHT_VARS,
  type ShadcnBaseThemeId,
} from "@/lib/shadcn-base-theme-tokens";

export const SHADCN_BASE_THEMES = [
  { id: "neutral", label: "Neutral" },
  { id: "stone", label: "Stone" },
  { id: "zinc", label: "Zinc" },
  { id: "mauve", label: "Mauve" },
  { id: "olive", label: "Olive" },
  { id: "mist", label: "Mist" },
  { id: "taupe", label: "Taupe" },
] as const satisfies ReadonlyArray<{ id: ShadcnBaseThemeId; label: string }>;

const THEME_VAR_NAMES = Array.from(
  new Set([
    ...Object.keys(SHADCN_BASE_THEME_LIGHT_VARS.neutral),
    ...Object.keys(SHADCN_BASE_THEME_DARK_VARS.neutral),
  ]),
);

export type { ShadcnBaseThemeId };

function pickRandomBase(): ShadcnBaseThemeId {
  return SHADCN_BASE_THEMES[
    Math.floor(Math.random() * SHADCN_BASE_THEMES.length)
  ].id;
}

const iconBtn =
  "cursor-pointer rounded-full text-secondary-foreground active:scale-97 disabled:opacity-70 hover:dark:bg-secondary";

/**
 * Applies the active shadcn base palette on the document root via inline custom
 * properties so tokens win over global.css `:root` / `.dark` rules.
 */
export function useShadcnBaseThemeOnDocument(
  base: ShadcnBaseThemeId,
  colorScheme: "light" | "dark" | null,
) {
  React.useLayoutEffect(() => {
    if (colorScheme == null) return;

    const root = document.documentElement;
    const vars =
      colorScheme === "dark"
        ? SHADCN_BASE_THEME_DARK_VARS[base]
        : SHADCN_BASE_THEME_LIGHT_VARS[base];

    for (const prop of THEME_VAR_NAMES) {
      const value = vars[prop as keyof typeof vars];
      if (value != null) {
        root.style.setProperty(prop, value);
      } else {
        root.style.removeProperty(prop);
      }
    }
    root.dataset.themeBase = base;
  }, [base, colorScheme]);

  React.useLayoutEffect(() => {
    return () => {
      const root = document.documentElement;
      for (const prop of THEME_VAR_NAMES) {
        root.style.removeProperty(prop);
      }
      root.removeAttribute("data-theme-base");
    };
  }, []);
}

export function ShadcnBaseThemeMenu() {
  const [base, setBase] = React.useState<ShadcnBaseThemeId>("neutral");
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const colorScheme =
    !mounted || resolvedTheme == null
      ? null
      : resolvedTheme === "light"
        ? "light"
        : "dark";

  useShadcnBaseThemeOnDocument(base, colorScheme);

  const current = SHADCN_BASE_THEMES.find((t) => t.id === base)?.label ?? base;
  const isLight = colorScheme === "light";
  const isDark = colorScheme === "dark";

  const randomizeLight = React.useCallback(() => {
    setBase(pickRandomBase());
    setTheme("light");
  }, [setTheme]);

  const randomizeDark = React.useCallback(() => {
    setBase(pickRandomBase());
    setTheme("dark");
  }, [setTheme]);

  return (
    <div className="pointer-events-none fixed right-6 bottom-6 z-200 flex justify-end p-0">
      <div
        className={cn(
          "pointer-events-auto flex items-center h-11 gap-1 px-1.5 py-1.5",
          "rounded-[24px] border border-border dark:border-border/50",
          "bg-card shadow-sm dark:bg-input/30",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(
            iconBtn,
            isLight &&
              "bg-secondary text-secondary-foreground hover:bg-secondary",
          )}
          aria-label="Light mode"
          aria-pressed={isLight}
          disabled={!mounted}
          onClick={() => setTheme("light")}
        >
          <HugeiconsIcon icon={Sun03Icon} strokeWidth={2} className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(
            iconBtn,
            isDark &&
              "bg-secondary text-secondary-foreground hover:bg-secondary",
          )}
          aria-label="Dark mode"
          aria-pressed={isDark}
          disabled={!mounted}
          onClick={() => setTheme("dark")}
        >
          <HugeiconsIcon icon={Moon02Icon} strokeWidth={2} className="size-4" />
        </Button>

        <span className="mx-0.5 h-5 w-px shrink-0 bg-border" aria-hidden />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "h-9 gap-1.5 rounded-full px-3 text-sm font-normal text-primary",
                "hover:bg-muted/80 dark:hover:bg-secondary",
              )}
              aria-label="Shadcn base theme"
            >
              <HugeiconsIcon
                icon={PaintBoardIcon}
                strokeWidth={2}
                className="size-4 text-muted-foreground"
              />
              <span>{current}</span>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                strokeWidth={2}
                className="size-4 text-muted-foreground"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52" sideOffset={8}>
            <DropdownMenuLabel className="text-muted-foreground">
              shadcn base
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={base}
              onValueChange={(v) => setBase(v as ShadcnBaseThemeId)}
            >
              {SHADCN_BASE_THEMES.map((t) => (
                <DropdownMenuRadioItem key={t.id} value={t.id}>
                  {t.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="mx-0.5 h-5 w-px shrink-0 bg-border" aria-hidden />

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={iconBtn}
          aria-label="Random shadcn base palette in light mode"
          title="Random palette · light"
          disabled={!mounted}
          onClick={randomizeLight}
        >
          <HugeiconsIcon
            icon={ShuffleSquareIcon}
            strokeWidth={2}
            className="size-4"
          />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={iconBtn}
          aria-label="Random shadcn base palette in dark mode"
          title="Random palette · dark"
          disabled={!mounted}
          onClick={randomizeDark}
        >
          <HugeiconsIcon
            icon={ShuffleIcon}
            strokeWidth={2}
            className="size-4"
          />
        </Button>
      </div>
    </div>
  );
}
