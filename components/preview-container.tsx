import { cn } from "@/lib/utils";

const ReviewContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={cn("flex w-full flex-col items-center justify-center rounded-xl bg-white dark:bg-gray-900 h-[412px] p-10 relative", className)}>
      {children}
    </div>
  );
};

export default ReviewContainer;
