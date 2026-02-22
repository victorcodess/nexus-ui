"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "./layout/theme-toggle";
import { SearchToggle } from "./layout/search-toggle";

import { Menu } from "lucide-react";
import { buttonVariants } from "./ui/button";

/**
 * Custom navbar – edit this file to change the navbar UI.
 * Used when nav.component is set in lib/layout.shared.tsx.
 */
export function Navbar() {
  const pathname = usePathname();
  const isDocs = pathname?.startsWith("/docs");
  const isComponents = pathname?.startsWith("/components");

  return (
    <header
      id="nd-nav"
      className={cn(
        "fixed top-0 z-40 h-14 w-full lg:px-20 2xl:px-40",
        "bg-white/90 dark:bg-background backdrop-blur-sm lg:backdrop-blur-none lg:bg-transparent dark:lg:bg-transparent",
        "*:mx-au to *:max-w-(--fd-layout-width)",
      )}
    >
      <nav className="flex h-14 w-full items-center justify-between gap-6 px-4 lg:px-6 lg:w-[calc(50%+40px)] 2xl:w-[calc(50%+80px)]">
        {/* Logo / title */}
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-1 text-base font-semibold"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className=""
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0 12C7.62742 12 12 7.62742 12 0C12 7.62742 16.3726 12 24 12C16.3726 12 12 16.3726 12 24C12 16.3726 7.62742 12 0 12Z"
              fill="currentColor"
            />
          </svg>
          Nexus UI
        </Link>

        {/* Main links */}
        <div className="flex flex-row items-center gap-2 max-sm:hidden">
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
            aria-label="github"
            className="[&amp;_svg]:size-5 inline-flex items-center justify-center rounded-full p-2 text-sm font-medium text-fd-muted-foreground transition-colors duration-100 hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            data-active="false"
            data-radix-collection-item=""
          >
            <svg role="img" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
            </svg>
          </a>

          <SearchToggle className="cursor-pointer rounded-full bg-transparent p-4.5 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground" />

          <ThemeToggle className="cursor-pointer rounded-full" />
        </div>

        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "lg:hidden",
          )}
          aria-label="Toggle Menu"
          // onClick={() => setOpenMenu(true)}
        >
          <Menu className="size-5" />
        </button>
      </nav>
    </header>
  );
}
