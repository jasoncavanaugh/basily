import { cn } from "../utils/cn";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        className,
        "animate-spin-fast rounded-full border-t-transparent dark:border-t-transparent"
      )}
    />
  );
}
