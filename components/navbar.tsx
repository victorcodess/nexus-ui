"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { SmallThemeToggle } from "./layout/theme-toggle";
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
  const isComponents = pathname?.startsWith("/docs/components");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="contents">
      <header
        id="nd-nav"
        className={cn(
          "fixed top-0 z-40 h-14 w-full lg:px-0 2xl:px-0",
          "bg-transparent backdrop-blur-none lg:backdrop-blur-none dark:bg-gray-900 dark:lg:bg-transparent",
          isDocs &&
            "overflow-hidden border-b border-dashed border-gray-200 px-0 lg:px-0 2xl:px-0 dark:border-white/10",
        )}
      >
        {isDocs && (
          <>
            <div
              className="absolute inset-0 dark:hidden"
              style={{
                background:
                  "repeating-linear-gradient(-45deg, #ffffff, #ffffff 14px, #F8F8F8 14px, #F8F8F8 16px)",
              }}
              aria-hidden
            />
            <div
              className="absolute inset-0 hidden dark:block"
              style={{
                background:
                  "repeating-linear-gradient(-45deg, #171717, #171717 14px, #1D1D1D 14px, #1D1D1D 16px)",
              }}
              aria-hidden
            />
          </>
        )}
        <nav
          className={cn(
            "relative flex h-14 w-full items-center justify-between gap-6 px-4 lg:px-6",
            isDocs && "w-full py-3 lg:w-full lg:px-5 2xl:w-full",
          )}
        >
          <Logo />

          {isDocs && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center max-md:hidden">
              <div className="pointer-events-auto">
                <LargeSearchToggle />
              </div>
            </div>
          )}

          <DesktopNav isDocs={isDocs} isComponents={isComponents} />

          <MobileNavTrigger
            onSearch={
              <SearchToggle className="size-10.5 cursor-pointer rounded-full bg-transparent text-gray-100 hover:text-gray-100 hover:bg-gray-800" />
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
    </div>
  );
}

/* ─── Logo ─────────────────────────────────────────────────────────── */

function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center gap-1 text-base font-medium text-gray-50"
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
      Nexus UI{" "}
      <span className="-mb-0.75 ml-0.5 text-xs font-[350] text-gray-400">
        v1.0
      </span>
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
      <Link
        href="/docs"
        className={cn(
          "cursor-pointer rounded-md px-3 py-2 text-sm transition-colors",
          isDocs && !isComponents
            ? "font-medium text-gray-900 dark:text-gray-400"
            : "text-gray-400 hover:text-gray-200",
        )}
      >
        Docs
      </Link>
      <Link
        href="/docs/components/prompt-input"
        className={cn(
          "cursor-pointer rounded-md px-3 py-2 text-sm transition-colors",
          isComponents
            ? "font-medium text-gray-900 dark:text-white"
            : "text-gray-400 hover:text-gray-200",
        )}
      >
        Components
      </Link>

      <a
        href="https://github.com/victorcodess/nexus-ui"
        rel="noreferrer noopener"
        target="_blank"
        aria-label="GitHub"
        className="inline-flex size-10.5 items-center justify-center rounded-full text-gray-400 transition-colors duration-200 hover:bg-gray-800 hover:text-gray-200"
      >
        <GithubIcon />
      </a>

      {isDocs && (
        <a
          href="https://x.com/victorwilliams_"
          rel="noreferrer noopener"
          target="_blank"
          aria-label="X / Twitter"
          className="inline-flex size-10.5 items-center justify-center rounded-full text-gray-400 transition-colors duration-200 hover:bg-gray-800 hover:text-gray-200"
        >
          <XIcon className="size-4.5" />
        </a>
      )}

      {/* {!isDocs && (
        <SearchToggle className="cursor-pointer rounded-full bg-transparent p-4.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900" />
      )} */}

      <SmallThemeToggle className="inline-flex size-10.5 items-center justify-center rounded-full text-gray-400 transition-colors duration-200 hover:bg-gray-800 hover:text-gray-200" />
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
    <div className="flex items-center gap-2 sm:hidden">
      {onSearch}
      <button
        type="button"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-10.5 cursor-pointer rounded-full text-gray-100 hover:text-gray-100 hover:bg-gray-800",
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
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/victorcodess/nexus-ui"
              rel="noreferrer noopener"
              target="_blank"
              aria-label="GitHub"
              className="inline-flex size-10.5 items-center justify-center rounded-full text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            >
              <GithubIcon className="size-4.5" />
            </a>
            <a
              href="https://x.com/victorwilliams_"
              rel="noreferrer noopener"
              target="_blank"
              aria-label="X / Twitter"
              className="inline-flex size-10.5 items-center justify-center rounded-full text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            >
              <XIcon className="size-4.5" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            <SmallThemeToggle className="size-10.5 cursor-pointer rounded-full" />
            <button
              type="button"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "size-10.5 cursor-pointer rounded-full",
              )}
              aria-label="Close Menu"
              onClick={onClose}
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <hr className="border-dashed border-gray-200 dark:border-white/10" />

        <nav className="flex-1 overflow-y-auto px-4 py-5">
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

export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
    >
      <path
        d="M11.2539 16.5039V13.5039C11.3582 12.5644 11.0889 11.6215 10.5039 10.8789C12.7539 10.8789 15.0039 9.37891 15.0039 6.75391C15.0639 5.81641 14.8014 4.89391 14.2539 4.12891C14.4639 3.26641 14.4639 2.36641 14.2539 1.50391C14.2539 1.50391 13.5039 1.50391 12.0039 2.62891C10.0239 2.25391 7.98391 2.25391 6.00391 2.62891C4.50391 1.50391 3.75391 1.50391 3.75391 1.50391C3.52891 2.36641 3.52891 3.26641 3.75391 4.12891C3.20781 4.89082 2.94276 5.8185 3.00391 6.75391C3.00391 9.37891 5.25391 10.8789 7.50391 10.8789C7.21141 11.2464 6.99391 11.6664 6.86641 12.1164C6.73891 12.5664 6.70141 13.0389 6.75391 13.5039M6.75391 13.5039V16.5039M6.75391 13.5039C3.37141 15.0039 3.00391 12.0039 1.50391 12.0039"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
    >
      <path
        d="M2.25 15.75L7.9113 10.0887M7.9113 10.0887L2.25 2.25H6L10.0887 7.9113M7.9113 10.0887L12 15.75H15.75L10.0887 7.9113M15.75 2.25L10.0887 7.9113"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
