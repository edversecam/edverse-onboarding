import { cn } from "@/lib/utils";

/**
 * Edverse mark — a graduation cap rendered in the brand blue.
 * Swap for the official asset any time by dropping `logo.svg` into /public
 * and pointing an <img> at it; this inline SVG keeps the app branded with
 * zero asset dependency.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
    >
      {/* cap */}
      <path
        d="M24 7 3 17l21 10 17-8.1V31a1.6 1.6 0 1 1-2 0v-9.8L24 27 7 19v6.3c0 2 7.6 5.7 17 5.7s17-3.7 17-5.7V17L24 7Z"
        fill="var(--brand)"
      />
      {/* tassel knot */}
      <circle cx="40" cy="33" r="2.4" fill="var(--brand)" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display text-xl font-semibold tracking-tight text-brand-700",
        className
      )}
    >
      Edverse
    </span>
  );
}

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      {showWordmark && <Wordmark />}
    </span>
  );
}
