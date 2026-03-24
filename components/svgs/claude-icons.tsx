import { cn } from "@/lib/utils";

function ClaudeAdd({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
      className={cn("size-4", className)}
    >
      <path d="M10 3C10.2761 3 10.5 3.22386 10.5 3.5V9.5H16.5L16.6006 9.50977C16.8286 9.55629 17 9.75829 17 10C17 10.2417 16.8286 10.4437 16.6006 10.4902L16.5 10.5H10.5V16.5C10.5 16.7761 10.2761 17 10 17C9.72386 17 9.5 16.7761 9.5 16.5V10.5H3.5C3.22386 10.5 3 10.2761 3 10C3 9.72386 3.22386 9.5 3.5 9.5H9.5V3.5C9.5 3.22386 9.72386 3 10 3Z"></path>
    </svg>
  );
}

function ClaudeAudioLines({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block overflow-visible", className)}
    >
      <rect
        x="0"
        y="7.5"
        height="6px"
        fill="currentColor"
        fillOpacity="1"
        width="1px"
        rx="0.5"
        ry="0.5"
      ></rect>
      <rect
        x="4"
        y="5.5"
        height="10px"
        fill="currentColor"
        fillOpacity="1"
        width="1px"
        rx="0.5"
        ry="0.5"
      ></rect>
      <rect
        x="8"
        y="2.5"
        height="16px"
        fill="currentColor"
        fillOpacity="1"
        width="1px"
        rx="0.5"
        ry="0.5"
      ></rect>
      <rect
        x="12"
        y="5.5"
        height="10px"
        fill="currentColor"
        fillOpacity="1"
        width="1px"
        rx="0.5"
        ry="0.5"
      ></rect>
      <rect
        x="16"
        y="2.5"
        height="16px"
        fill="currentColor"
        fillOpacity="1"
        width="1px"
        rx="0.5"
        ry="0.5"
      ></rect>
      <rect
        x="20"
        y="7.5"
        height="6px"
        fill="currentColor"
        fillOpacity="1"
        width="1px"
        rx="0.5"
        ry="0.5"
      ></rect>
    </svg>
  );
}

function ClaudeCaret({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
      className={cn("size-4", className)}
    >
      <path d="M14.128 7.16482C14.3126 6.95983 14.6298 6.94336 14.835 7.12771C15.0402 7.31242 15.0567 7.62952 14.8721 7.83477L10.372 12.835L10.2939 12.9053C10.2093 12.9667 10.1063 13 9.99995 13C9.85833 12.9999 9.72264 12.9402 9.62788 12.835L5.12778 7.83477L5.0682 7.75273C4.95072 7.55225 4.98544 7.28926 5.16489 7.12771C5.34445 6.96617 5.60969 6.95939 5.79674 7.09744L5.87193 7.16482L9.99995 11.7519L14.128 7.16482Z"></path>
    </svg>
  );
}

export { ClaudeAdd, ClaudeAudioLines, ClaudeCaret };
