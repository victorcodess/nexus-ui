import { cn } from "@/lib/utils";

function GeminiCaret({ className }: { className?: string }) {
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
      strokeLinejoin="round"
      className={cn("size-4 text-[#171717] dark:text-[#FAFAFA]", className)}
    >
      <path d="M268-612 480-400 692-612" />
    </svg>
  );
}

export default GeminiCaret;
