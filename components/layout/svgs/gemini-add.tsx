import { cn } from "@/lib/utils";
import React from "react";

function GeminiAdd({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="none"
      stroke="currentColor"
      strokeWidth={80}
      strokeLinecap="round"
      className={cn("size-4 text-[#171717] dark:text-[#FAFAFA]", className)}
    >
      <path d="M160-480h640M480-160v-640" />
    </svg>
  );
}

export default GeminiAdd;
