import { cn } from "@/lib/utils";

/**
 * tribeMail™ logo slot.
 *
 * Placeholder mark until the final tribeMail™ logo lands. Swap the SVG below
 * (and app/icon.svg) for the real artwork; every brand surface renders this
 * component, so nothing else needs to change.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="tribeMail™"
      className={cn("size-8 shrink-0", className)}
    >
      <rect width="64" height="64" rx="14" fill="#f97316" />
      <path d="M14 22h36v22a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4z" fill="#fff" />
      <path
        d="M14 22l18 14 18-14"
        fill="none"
        stroke="#c2410c"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="18" r="7" fill="#f59e0b" stroke="#fff" strokeWidth="3" />
    </svg>
  );
}

/** "tribeMail™" wordmark text. */
export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-bold tracking-tight", className)}>
      tribe<span className="text-primary">Mail</span>™
    </span>
  );
}
