export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-t-transparent ${className}`}
    />
  );
}
export default Spinner;
