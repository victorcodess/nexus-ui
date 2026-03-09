import type { ReactNode } from "react";

export function Steps({ children }: { children: ReactNode }) {
  return (
    <div className="relative ml-2 border-l border-gray-200 pl-6 [counter-reset:step] sm:ml-4 sm:pl-7 dark:border-white/10">
      {children}
    </div>
  );
}

export function Step({ children }: { children: ReactNode }) {
  return (
    <div className="relative [counter-increment:step] before:absolute before:-start-11 before:-top-1.5 before:flex before:size-8 before:items-center before:justify-center before:rounded-full before:border-4 before:border-white before:bg-gray-100 before:text-xs before:text-gray-900 before:content-[counter(step)] dark:before:border-white/10 dark:before:bg-white/5 dark:before:text-gray-400 [&>h3]:mt-0 [&>h4]:mt-0">
      {children}
    </div>
  );
}
