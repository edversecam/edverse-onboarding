"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SlideBlock as SlideBlockT, Slide } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RichContent } from "./RichText";

/** A single thing the carousel shows: a slide image and/or text. */
type View = { id: string; imgSrc?: string; title?: string; body?: string };

export function SlideBlock({ block }: { block: SlideBlockT }) {
  const [i, setI] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFull, setIsFull] = useState(false);
  const views = useExpandedViews(block.slides);

  // Keep our state in sync with the browser's native fullscreen.
  useEffect(() => {
    const onChange = () => setIsFull(document.fullscreenElement === cardRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // If the deck expanded/collapsed and the current index is now out of range, clamp it.
  useEffect(() => {
    setI((n) => Math.max(0, Math.min(views.length - 1, n)));
  }, [views.length]);

  const toggleFull = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      cardRef.current?.requestFullscreen?.();
    }
  }, []);

  if (views.length === 0) return null;

  const total = views.length;
  const clamp = (n: number) => Math.max(0, Math.min(total - 1, n));
  const view = views[Math.min(i, total - 1)];

  return (
    <div
      ref={cardRef}
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]",
        isFull && "flex h-screen w-screen flex-col rounded-none border-0 bg-black"
      )}
    >
      {/* Slide body */}
      <div
        className={cn(
          "min-h-[16rem] p-6 sm:p-8",
          isFull && "flex flex-1 items-center justify-center p-3"
        )}
      >
        {view.imgSrc ? (
          <div
            className={cn(
              "group relative overflow-hidden rounded-xl border border-border bg-surface-2",
              isFull ? "h-full w-full border-0 bg-transparent" : "mb-5 aspect-video w-full"
            )}
          >
            <button
              type="button"
              onClick={() => setI((n) => (n + 1) % total)}
              title="Click for the next slide"
              className="block h-full w-full cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={view.imgSrc}
                alt={view.title ?? `Slide ${i + 1}`}
                className={cn(
                  "h-full w-full object-contain transition",
                  !isFull && "group-hover:brightness-95"
                )}
              />
            </button>
            <button
              type="button"
              onClick={toggleFull}
              aria-label={isFull ? "Exit full screen" : "Full screen"}
              title={isFull ? "Exit full screen" : "Full screen"}
              className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-lg bg-black/55 text-white opacity-0 transition hover:bg-black/75 focus-visible:opacity-100 group-hover:opacity-100"
            >
              <FullscreenIcon expanded={isFull} />
            </button>
          </div>
        ) : null}

        {!isFull && view.title && (
          <h4 className="mb-2 font-display text-2xl font-semibold text-foreground">
            {view.title}
          </h4>
        )}
        {!isFull && view.body && <RichContent text={view.body} className="text-[15px]" />}
      </div>

      {/* Controls */}
      <div
        className={cn(
          "flex items-center justify-between gap-3 border-t border-border px-4 py-3",
          isFull ? "bg-black/80" : "bg-surface-2/60"
        )}
      >
        {/* Minimized Back — icon only */}
        <button
          type="button"
          onClick={() => setI((n) => clamp(n - 1))}
          disabled={i === 0}
          aria-label="Back"
          title="Back"
          className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-foreground transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Arrow dir="left" />
        </button>

        <div className="flex items-center gap-1.5">
          {views.map((v, idx) => (
            <button
              key={v.id}
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
 * Builds the list of views from the block's sub-slides. A bare Google Slides
 * deck link (no specific slide) is expanded into one image per deck slide via
 * /api/slides; if that key/endpoint isn't available it falls back to the deck's
 * first slide. Plain images and slide-specific links map 1:1.
 */
function useExpandedViews(slides: Slide[]): View[] {
  const signature = slides.map((s) => `${s.id}:${s.imageUrl ?? ""}`).join("|");
  const [views, setViews] = useState<View[]>(() => slides.map(baseView));

  useEffect(() => {
    const base = slides.map(baseView);
    setViews(base);

    let cancelled = false;
    (async () => {
      const out: View[] = [];
      let expanded = false;
      for (const s of slides) {
        const deck = s.imageUrl ? parseGoogleDeck(s.imageUrl) : null;
        if (deck && !deck.pageId) {
          try {
            const res = await fetch(`/api/slides?id=${encodeURIComponent(deck.deckId)}`);
            const data: { pageIds?: string[] } = await res.json();
            const ids = data.pageIds ?? [];
            if (ids.length > 1) {
              for (const pid of ids) {
                out.push({
                  id: `${s.id}:${pid}`,
                  imgSrc: `https://docs.google.com/presentation/d/${deck.deckId}/export/png?pageid=${pid}`,
                });
              }
              expanded = true;
              continue;
            }
          } catch {
            // fall through to the single-image fallback below
          }
        }
        out.push(baseView(s));
      }
      if (!cancelled && expanded) setViews(out);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return views;
}

function baseView(s: Slide): View {
  return {
    id: s.id,
    imgSrc: s.imageUrl ? toImageUrl(s.imageUrl) : undefined,
    title: s.title,
    body: s.body,
  };
}

/** Parse a Google Slides deck link into its deck id and optional slide id. */
function parseGoogleDeck(url: string): { deckId: string; pageId: string | null } | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname !== "docs.google.com") return null;
    const m = u.pathname.match(/\/presentation\/d\/(?!e\/)([^/]+)/);
    if (!m) return null;
    const page = (u.hash + u.search).match(/slide=id\.([A-Za-z0-9_-]+)/);
    return { deckId: m[1], pageId: page ? page[1] : null };
  } catch {
    return null;
  }
}

/**
 * Turn a Google Slides link into a static slide image (PNG export). A link to a
 * specific slide exports that slide; a bare deck link exports the first slide.
 * Plain image URLs are returned unchanged. The deck must be shared "Anyone with
 * the link can view" for the export to load.
 */
function toImageUrl(url: string): string {
  const deck = parseGoogleDeck(url);
  if (!deck) return url;
  const base = `https://docs.google.com/presentation/d/${deck.deckId}/export/png`;
  return deck.pageId ? `${base}?pageid=${deck.pageId}` : base;
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

function FullscreenIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      {expanded ? (
        <path
          d="M9 4v3a2 2 0 0 1-2 2H4M20 9h-3a2 2 0 0 1-2-2V4M4 15h3a2 2 0 0 1 2 2v3M15 20v-3a2 2 0 0 1 2-2h3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M8 4H5a1 1 0 0 0-1 1v3M16 4h3a1 1 0 0 1 1 1v3M8 20H5a1 1 0 0 1-1-1v-3M16 20h3a1 1 0 0 0 1-1v-3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
