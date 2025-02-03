import { cn } from "@/lib/utils";

interface SimpleAnalyticsLogoProps {
  className?: string;
}

export function SimpleAnalyticsLogo({ className }: SimpleAnalyticsLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn("fill-red-500 dark:fill-red-600", className)}
      viewBox="0 0 1000 1000"
      width="24px"
      height="24px"
    >
      <path d="M54 538h154v462H54zm369-276h154v738H423zM792 0h154v1000H792z"></path>
    </svg>
  );
}
