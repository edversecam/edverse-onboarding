"use client";

import { useState } from "react";
import { SlideBlock as SlideBlockT } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RichContent } from "./RichText";

export function SlideBlock({ block }: { block: SlideBlockT }) {
  const [i, setI] = useState(0);
  const slides = block.slides;
  if (slides.length === 0) return null;

  const total = slides.length;
  const clamp = (n: number) => Math.max(0, Math.min(total - 1, n));
  const slide = slides[i];
  const embedUrl = slide.imageUrl ? slideEmbedUrl(slide.imageUrl) : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
      {/* Slide body */}
      <div className="min-h-[16rem] p-6 sm:p-8">
        {embedUrl ? (
          <div className="mb-5 aspect-video w-full overflow-hidden rounded-xl border border-border bg-surface-2">
            <iframe
              src={embedUrl}
              title={slide.title ?? "Slide"}
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        ) : slide.imageUrl ? (
          <button
            type="button"
            onClick={() => setI((n) => (n + 1) % total)}
            title="Click for the next slide"
            className="group mb-5 block w-full cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.imageUrl}
              alt={slide.title ?? ""}
              className="max-h-72 w-full rounded-xl border border-border object-cover transition group-hover:brightness-95"
            />
          </button>
        ) : null}
        {slide.title && (
          <h4 className="mb-2 font-display text-2xl font-semibold text-foreground">
            {slide.title}
          </h4>
        )}
        <RichContent text={slide.body} className="text-[15px]" />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-2/60 px-4 py-3">
        <button
          type="button"
          onClick={() => setI((n) => clamp(n - 1))}
          disabled={i === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Arrow dir="left" />
          Back
        </button>

        <div className="flex items-center gap-1.5">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setI(idx)}
              className={cn(
                "h-2 rounded-full transition-all",
                idx === i ? "w-5 bg-brand" : "w-2 bg-border hover:bg-brand/40"
              )}
            />
          ))}
          <span className="ml-2 text-xs font-semibold text-muted">
            {i + 1} / {total}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setI((n) => clamp(n + 1))}
          disabled={i === total - 1}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <Arrow dir="right" />
        </button>
      </div>
    </div>
  );
}

/**
 * If the URL points at a Google Slides deck, return an embeddable player URL.
 * Handles both normal decks (/presentation/d/ID/...) and published decks
 * (/presentation/d/e/ID/...). Returns null for plain image URLs, which are
 * rendered with an img tag instead.
 */
function slideEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname !== "docs.google.com" || !u.pathname.includes("/presentation/")) return null;
    const published = u.pathname.match(/\/presentation\/d\/e\/([^/]+)/);
    if (published) {
      return `https://docs.google.com/presentation/d/e/${published[1]}/embed?start=false&loop=false&delayms=60000`;
    }
    const deck = u.pathname.match(/\/presentation\/d\/([^/]+)/);
    if (deck) {
      return `https://docs.google.com/presentation/d/${deck[1]}/embed?start=false&loop=false&delayms=60000`;
    }
    return null;
  } catch {
    return null;
  }
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-4 w-4", dir === "left" && "rotate-180")}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
