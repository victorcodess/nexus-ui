import { cn } from "@/lib/utils";

function GeminiMic({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="currentColor"
      className={cn("size-4 text-[#171717] dark:text-[#FAFAFA]", className)}
    >
      <path d="M395-435q-35-35-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35q-50 0-85-35Zm85-205Zm-40 520v-123q-104-14-172-93t-68-184a40,40,0,0,1,80,0q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520a40,40,0,0,1,80,0q0 105-68 184t-172 93v123a40,40,0,0,1,-80,0Z" />
    </svg>
  );
}

export default GeminiMic;
