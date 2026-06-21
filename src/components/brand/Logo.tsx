import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Edverse mark — a graduation cap. Uses `currentColor` so it can be recoloured
 * by the parent (e.g. white on the brand panel). Swap for the official asset
 * any time by dropping `logo.svg` into /public.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn("h-8 w-8 text-brand", className)}
      aria-hidden="true"
    >
      <path
        d="M24 7 3 17l21 10 17-8.1V31a1.6 1.6 0 1 1-2 0v-9.8L24 27 7 19v6.3c0 2 7.6 5.7 17 5.7s17-3.7 17-5.7V17L24 7Z"
        fill="currentColor"
      />
      <circle cx="40" cy="33" r="2.4" fill="currentColor" />
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
  light = false,
  href = "/",
}: {
  className?: string;
  showWordmark?: boolean;
  light?: boolean;
  /** Where clicking the logo goes. Defaults to the home page. Pass null to render a non-clickable mark. */
  href?: string | null;
}) {
  const inner = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={light ? "text-white" : "text-brand"} />
      {showWordmark && <Wordmark className={light ? "text-white" : undefined} />}
    </span>
  );

  if (href === null) return inner;

  return (
    <Link
      href={href}
      aria-label="Go to home"
      className="inline-flex rounded-md outline-none transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand"
    >
      {inner}
    </Link>
  );
}
