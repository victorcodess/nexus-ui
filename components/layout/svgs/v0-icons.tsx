import { cn } from "@/lib/utils";

function V0Plus({ className }: { className?: string }) {
  return (
    <svg
      data-testid="geist-icon"
      height="16"
      strokeLinejoin="round"
      viewBox="0 0 16 16"
      width="16"
      style={{ color: "currentcolor" }}
      className={cn("size-4", className)}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 8.75,1 H7.25 V7.25 H1.5 V8.75 H7.25 V15 H8.75 V8.75 H14.5 V7.25 H8.75 V1.75 Z"
      ></path>
    </svg>
  );
}

function V0Model({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-4", className)}
    >
      <path
        d="M7 7.25C7 7.11193 7.11193 7 7.25 7H8.75C8.88807 7 9 7.11193 9 7.25V8.75C9 8.88807 8.88807 9 8.75 9H7.25C7.11193 9 7 8.88807 7 8.75V7.25Z"
        fill="currentColor"
        stroke="currentColor"
        stroke-width="1.5"
      ></path>
      <path
        d="M4 6C4 4.89543 4.89543 4 6 4L10 4C11.1046 4 12 4.89543 12 6V10C12 11.1046 11.1046 12 10 12H6C4.89543 12 4 11.1046 4 10L4 6Z"
        stroke="currentColor"
        stroke-width="1.5"
      ></path>
      <path
        d="M1 5C1 2.79086 2.79086 1 5 1L11 1C13.2091 1 15 2.79086 15 5V11C15 13.2091 13.2091 15 11 15H5C2.79086 15 1 13.2091 1 11V5Z"
        stroke="currentColor"
        stroke-width="1.5"
      ></path>
    </svg>
  );
}

function V0ArrowUp({ className }: { className?: string }) {
  return (
    <svg
      data-testid="geist-icon"
      height="16"
      strokeLinejoin="round"
      viewBox="0 0 16 16"
      width="16"
      style={{ color: "currentcolor" }}
      className={cn("size-4", className)}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.70711 1.39644C8.31659 1.00592 7.68342 1.00592 7.2929 1.39644L2.21968 6.46966L1.68935 6.99999L2.75001 8.06065L3.28034 7.53032L7.25001 3.56065V14.25V15H8.75001V14.25V3.56065L12.7197 7.53032L13.25 8.06065L14.3107 6.99999L13.7803 6.46966L8.70711 1.39644Z"
      ></path>
    </svg>
  );
}

function V0Caret({ className }: { className?: string }) {
  return (
    <svg
      data-testid="geist-icon"
      height="16"
      strokeLinejoin="round"
      viewBox="0 0 16 16"
      width="16"
      style={{ color: "currentcolor" }}
      className={cn("size-4", className)}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.0607 6.74999L11.5303 7.28032L8.7071 10.1035C8.31657 10.4941 7.68341 10.4941 7.29288 10.1035L4.46966 7.28032L3.93933 6.74999L4.99999 5.68933L5.53032 6.21966L7.99999 8.68933L10.4697 6.21966L11 5.68933L12.0607 6.74999Z"

      ></path>
    </svg>
  );
}

export { V0Plus, V0Model, V0ArrowUp, V0Caret };
