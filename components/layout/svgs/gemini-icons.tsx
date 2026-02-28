import { cn } from "@/lib/utils";

export function GeminiAdd({ className }: { className?: string }) {
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

export function GeminiPageInfo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="currentColor"
      className={cn("size-4 text-[#171717] dark:text-[#FAFAFA]", className)}
    >
      <path d="M603.5-193.5Q560-237 560-300t43.5-106.5Q647-450 710-450t106.5 43.5Q860-363 860-300t-43.5 106.5Q773-150 710-150t-106.5-43.5Zm156-57Q780-271 780-300t-20.5-49.5Q739-370 710-370t-49.5 20.5Q640-329 640-300t20.5 49.5Q681-230 710-230t49.5-20.5ZM200-260H440a40,40,0,0,0,0-80H200a40,40,0,0,0,0,80ZM143.5-553.5Q100-597 100-660t43.5-106.5Q187-810 250-810t106.5 43.5Q400-723 400-660t-43.5 106.5Q313-510 250-510t-106.5-43.5Zm156-57Q320-631 320-660t-20.5-49.5Q279-730 250-730t-49.5 20.5Q180-689 180-660t20.5 49.5Q221-590 250-590t49.5-20.5ZM520-620H760a40,40,0,0,0,0-80H520a40,40,0,0,0,0,80ZM710-300ZM250-660Z" />
    </svg>
  );
}

export function GeminiMic({ className }: { className?: string }) {
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

export function GeminiCaret({ className }: { className?: string }) {
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
