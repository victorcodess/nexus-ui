import { cn } from "@/lib/utils";

export default function NexusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={cn("size-4 text-gray-900 dark:text-gray-50", className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 12C7.62742 12 12 7.62742 12 0C12 7.62742 16.3726 12 24 12C16.3726 12 12 16.3726 12 24C12 16.3726 7.62742 12 0 12Z"
        fill="currentColor"
      />
    </svg>
  );
}
