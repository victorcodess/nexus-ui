"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "./layout/theme-toggle";
import { LargeSearchToggle, SearchToggle } from "./layout/search-toggle";
import type { NavItem } from "@/lib/source";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "./ui/button";
import { useCallback, useEffect, useState } from "react";

interface NavbarProps {
  navItems?: NavItem[];
}

export function Navbar({ navItems = [] }: NavbarProps) {
  const pathname = usePathname();
  const isDocs = pathname?.startsWith("/docs");
  const isComponents = pathname?.startsWith("/components");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  useEffect(() => {
    if (sidebarOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [sidebarOpen]);

  return (
    <>
      <header
        id="nd-nav"
        className={cn(
          "fixed top-0 z-40 h-14 w-full lg:px-20 2xl:px-40",
          "bg-white/90 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none dark:bg-background dark:lg:bg-transparent",
          isDocs &&
            "border-b border-dashed border-gray-200 bg-white! px-0 lg:px-0 2xl:px-0 dark:border-white/10 dark:bg-fd-background!",
        )}
      >
        <nav
          className={cn(
            "flex h-14 w-full items-center justify-between gap-6 px-4 lg:w-[calc(50%+40px)] lg:px-6 2xl:w-[calc(50%+80px)]",
            isDocs && "w-full py-3 lg:w-full lg:px-5 2xl:w-full",
          )}
        >
          <Logo />

          <DesktopNav isDocs={isDocs} isComponents={isComponents} />

          <MobileNavTrigger
            onSearch={
              <SearchToggle className="cursor-pointer rounded-full bg-transparent p-4.5 text-gray-900 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-100 dark:hover:bg-gray-800" />
            }
            onMenuOpen={() => setSidebarOpen(true)}
          />
        </nav>
      </header>

      <MobileSidebar
        open={sidebarOpen}
        onClose={closeSidebar}
        navItems={navItems}
        pathname={pathname}
      />
    </>
  );
}

/* ─── Logo ─────────────────────────────────────────────────────────── */

function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center gap-1 text-base font-medium"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 12C7.62742 12 12 7.62742 12 0C12 7.62742 16.3726 12 24 12C16.3726 12 12 16.3726 12 24C12 16.3726 7.62742 12 0 12Z"
          fill="currentColor"
        />
      </svg>
      Nexus UI <span className="text-xs font-[350] text-gray-400 -mb-0.75 ml-0.5">v1.0</span>
    </Link>
  );
}

/* ─── Desktop Nav ──────────────────────────────────────────────────── */

function DesktopNav({
  isDocs,
  isComponents,
}: {
  isDocs: boolean | undefined;
  isComponents: boolean | undefined;
}) {
  return (
    <div className="flex flex-row items-center gap-2 max-sm:hidden">
      {isDocs && <LargeSearchToggle />}
      <Link
        href="/docs"
        className={cn(
          "cursor-pointer rounded-md px-3 py-2 text-sm transition-colors",
          isDocs
            ? "font-medium text-fd-primary"
            : "text-fd-muted-foreground hover:text-fd-accent-foreground",
        )}
      >
        Docs
      </Link>
      <Link
        href="/docs/test"
        className={cn(
          "cursor-pointer rounded-md px-3 py-2 text-sm transition-colors",
          isComponents
            ? "font-medium text-fd-primary"
            : "text-fd-muted-foreground hover:text-fd-accent-foreground",
        )}
      >
        Components
      </Link>

      <a
        href="https://github.com/victorcodess/nexus-ui"
        rel="noreferrer noopener"
        target="_blank"
        aria-label="GitHub"
        className="inline-flex items-center justify-center rounded-full p-2 text-sm font-medium text-fd-muted-foreground transition-colors duration-100 hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5"
      >
        <GithubIcon />
      </a>

      {!isDocs && (
        <SearchToggle className="cursor-pointer rounded-full bg-transparent p-4.5 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground" />
      )}

      <ThemeToggle className="cursor-pointer rounded-full" />
    </div>
  );
}

/* ─── Mobile Nav Trigger ───────────────────────────────────────────── */

function MobileNavTrigger({
  onSearch,
  onMenuOpen,
}: {
  onSearch: React.ReactNode;
  onMenuOpen: () => void;
}) {
  return (
    <div className="flex items-center sm:hidden">
      {onSearch}
      <button
        type="button"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "cursor-pointer rounded-full",
        )}
        aria-label="Toggle Menu"
        onClick={onMenuOpen}
      >
        <Menu className="size-5" />
      </button>
    </div>
  );
}

/* ─── Mobile Sidebar ───────────────────────────────────────────────── */

function MobileSidebar({
  open,
  onClose,
  navItems,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
  pathname: string | null;
}) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-white/4 backdrop-blur-[2px] transition-opacity duration-300 sm:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[85%] max-w-sm flex-col border-l border-gray-200 bg-white transition-transform duration-300 ease-in-out sm:hidden dark:border-white/10 dark:bg-fd-background",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between px-4">
          <div className="flex items-center gap-1">
            <a
              href="https://github.com/victorcodess/nexus-ui"
              rel="noreferrer noopener"
              target="_blank"
              aria-label="GitHub"
              className="inline-flex items-center justify-center rounded-full p-2 text-fd-muted-foreground hover:text-fd-foreground"
            >
              <GithubIcon className="size-5" />
            </a>
            <a
              href="https://x.com/victorwilliams_"
              rel="noreferrer noopener"
              target="_blank"
              aria-label="X / Twitter"
              className="inline-flex items-center justify-center rounded-full p-2 text-fd-muted-foreground hover:text-fd-foreground"
            >
              <XIcon className="size-5" />
            </a>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle className="cursor-pointer rounded-full" />
            <button
              type="button"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "cursor-pointer rounded-full",
              )}
              aria-label="Close Menu"
              onClick={onClose}
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <hr className="border-dashed border-gray-200 dark:border-white/10" />

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="flex flex-col items-end gap-1">
            {navItems.map((item, i) =>
              item.type === "separator" ? (
                <p
                  key={i}
                  className="mt-4 pb-1 text-xs font-medium tracking-wide text-gray-400 first:mt-0 dark:text-gray-500"
                >
                  {item.name}
                </p>
              ) : (
                <Link
                  key={item.url}
                  href={item.url}
                  onClick={onClose}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm transition-colors",
                    isNavActive(item.url, pathname)
                      ? "bg-gray-100 font-medium text-gray-900 dark:bg-white/10 dark:text-gray-100"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
                  )}
                >
                  {item.name}
                </Link>
              ),
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────────── */

function isNavActive(url: string, pathname: string | null): boolean {
  if (!pathname) return false;
  if (url === "/docs") return pathname === "/docs";
  return pathname === url || pathname.startsWith(url + "/");
}

/* ─── Icons ────────────────────────────────────────────────────────── */

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}
