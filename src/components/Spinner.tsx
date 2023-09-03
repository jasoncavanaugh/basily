import { cn } from "src/utils/cn";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-t-transparent",
        className
      )}
    />
  );
}
export default Spinner;
