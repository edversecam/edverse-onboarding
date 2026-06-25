"use client";

import { useEffect, useRef, useState } from "react";
import { SlideBlock as SlideBlockT, Slide } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RichContent } from "./RichText";

/** A single thing the carousel shows: a slide image, an embed, and/or text. */
type View = {
  id: string;
  imgSrc?: string;
  embedSrc?: string;
  /** Original deck link, used to open the native presentation (Gamma). */
  linkUrl?: string;
  title?: string;
  body?: string;
};

export function SlideBlock({ block }: { block: SlideBlockT }) {
  const [i, setI] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const [fsEl, setFsEl] = useState<Element | null>(null);
  const views = useExpandedViews(block.slides);

  // Track which element (if any) is currently fullscreen.
  useEffect(() => {
    const onChange = () => setFsEl(document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // If the deck expanded/collapsed and the current index is now out of range, clamp it.
  useEffect(() => {
    setI((n) => Math.max(0, Math.min(views.length - 1, n)));
  }, [views.length]);

  if (views.length === 0) return null;

  const total = views.length;
  const clamp = (n: number) => Math.max(0, Math.min(total - 1, n));
  const view = views[Math.min(i, total - 1)];
  const isEmbed = Boolean(view.embedSrc);
  const isCardFull = fsEl != null && fsEl === cardRef.current;
  const isAnyFull = fsEl != null;

  // For a Gamma embed, present the player edge-to-edge (like Gamma's own present
  // mode). For image decks, fullscreen the whole card so Edverse's Back/Next stay
  // on screen.
  const toggleFull = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else if (isEmbed) {
      mediaRef.current?.requestFullscreen?.();
    } else {
      cardRef.current?.requestFullscreen?.();
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]",
        isCardFull && "flex h-screen w-screen flex-col rounded-none border-0 bg-black"
      )}
    >
      {/* Slide body */}
      <div
        className={cn(
          "min-h-[16rem] p-6 sm:p-8",
          isCardFull && "flex flex-1 items-center justify-center p-3"
        )}
      >
        {view.embedSrc || view.imgSrc ? (
          <div
            ref={mediaRef}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-border bg-surface-2",
              isAnyFull ? "h-full w-full border-0 bg-transparent" : "mb-5 aspect-video w-full"
            )}
          >
            {view.embedSrc ? (
              <iframe
                src={view.embedSrc}
                title={view.title ?? `Slide ${i + 1}`}
                allow="fullscreen"
                allowFullScreen
                className="h-full w-full bg-white"
              />
            ) : (
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
                    !isAnyFull && "group-hover:brightness-95"
                  )}
                />
              </button>
            )}
            {view.embedSrc && view.linkUrl && (
              <a
                href={view.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open this deck in Gamma's presentation mode (new tab)"
                className="absolute left-2 top-2 z-10 inline-flex items-center gap-1.5 rounded-lg bg-black/55 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-black/75"
              >
                Present in Gamma
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
            <button
              type="button"
              onClick={toggleFull}
              aria-label={isAnyFull ? "Exit full screen" : "Full screen"}
              title={isAnyFull ? "Exit full screen" : isEmbed ? "Present full screen" : "Full screen"}
              className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-lg bg-black/55 text-white opacity-0 transition hover:bg-black/75 focus-visible:opacity-100 group-hover:opacity-100"
            >
              <FullscreenIcon expanded={isAnyFull} />
            </button>
          </div>
        ) : null}

        {!isCardFull && view.title && (
          <h4 className="mb-2 font-display text-2xl font-semibold text-foreground">
            {view.title}
          </h4>
        )}
        {!isCardFull && view.body && <RichContent text={view.body} className="text-[15px]" />}
      </div>

      {/* Controls */}
      <div
        className={cn(
          "flex items-center justify-between gap-3 border-t border-border px-4 py-3",
          isCardFull ? "bg-black/80" : "bg-surface-2/60"
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
  const src = s.imageUrl?.trim();
  if (!src) return { id: s.id, title: s.title, body: s.body };
  const gamma = gammaEmbedUrl(src);
  if (gamma) return { id: s.id, embedSrc: gamma, linkUrl: src, title: s.title, body: s.body };
  return { id: s.id, imgSrc: toImageUrl(src), title: s.title, body: s.body };
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

/**
 * Turn a Gamma deck link into its embeddable player URL. Gamma exposes decks
 * only as an interactive embed (no per-card image export), so a Gamma link is
 * shown as Gamma's own player. Share URLs end in the deck token
 * (…/docs/Title-<token>); the embed lives at gamma.app/embed/<token>. The deck
 * must be shared publicly for learners to see it. Returns null for non-Gamma URLs.
 */
function gammaEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (!/(^|\.)gamma\.app$/.test(u.hostname)) return null;
    if (u.pathname.startsWith("/embed/")) return `https://gamma.app${u.pathname}`;
    const segment = u.pathname.split("/").filter(Boolean).pop();
    if (!segment) return null;
    const token = segment.includes("-") ? segment.slice(segment.lastIndexOf("-") + 1) : segment;
    return token ? `https://gamma.app/embed/${token}` : null;
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
