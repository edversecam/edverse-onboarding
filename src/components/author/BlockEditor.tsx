"use client";

import { Block } from "@/lib/types";
import { uid } from "@/lib/store";
import { QuizEditor } from "./QuizEditor";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

export function BlockEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (b: Block) => void;
}) {
  switch (block.kind) {
    case "text":
      return (
        <div className="space-y-3">
          <Row label="Heading">
            <input value={block.heading ?? ""} onChange={(e) => onChange({ ...block, heading: e.target.value })} className="input" />
          </Row>
          <Row label="Body (supports **bold**, *italic*, and - bullets)">
            <textarea value={block.body} onChange={(e) => onChange({ ...block, body: e.target.value })} rows={5} className="input" />
          </Row>
        </div>
      );

    case "text-image":
      return (
        <div className="space-y-3">
          <Row label="Heading">
            <input value={block.heading ?? ""} onChange={(e) => onChange({ ...block, heading: e.target.value })} className="input" />
          </Row>
          <Row label="Body">
            <textarea value={block.body} onChange={(e) => onChange({ ...block, body: e.target.value })} rows={4} className="input" />
          </Row>
          <div className="grid gap-3 sm:grid-cols-2">
            <Row label="Image URL">
              <input value={block.imageUrl} onChange={(e) => onChange({ ...block, imageUrl: e.target.value })} className="input" />
            </Row>
            <Row label="Image side">
              <select
                value={block.imageSide ?? "right"}
                onChange={(e) => onChange({ ...block, imageSide: e.target.value as "left" | "right" })}
                className="input"
              >
                <option value="right">Right</option>
                <option value="left">Left</option>
              </select>
            </Row>
          </div>
          <Row label="Alt text">
            <input value={block.imageAlt ?? ""} onChange={(e) => onChange({ ...block, imageAlt: e.target.value })} className="input" />
          </Row>
        </div>
      );

    case "callout":
      return (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Row label="Tone">
              <select
                value={block.tone}
                onChange={(e) => onChange({ ...block, tone: e.target.value as "info" | "success" | "warning" })}
                className="input"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
              </select>
            </Row>
            <Row label="Title">
              <input value={block.title ?? ""} onChange={(e) => onChange({ ...block, title: e.target.value })} className="input" />
            </Row>
          </div>
          <Row label="Body">
            <textarea value={block.body} onChange={(e) => onChange({ ...block, body: e.target.value })} rows={3} className="input" />
          </Row>
        </div>
      );

    case "accordion":
      return (
        <div className="space-y-3">
          <Row label="Heading">
            <input value={block.heading ?? ""} onChange={(e) => onChange({ ...block, heading: e.target.value })} className="input" />
          </Row>
          {block.items.map((it) => (
            <div key={it.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <input
                  value={it.title}
                  placeholder="Title"
                  onChange={(e) =>
                    onChange({ ...block, items: block.items.map((x) => (x.id === it.id ? { ...x, title: e.target.value } : x)) })
                  }
                  className="input font-semibold"
                />
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() => onChange({ ...block, items: block.items.filter((x) => x.id !== it.id) })}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-danger hover:bg-danger-tint"
                >
                  ✕
                </button>
              </div>
              <textarea
                value={it.body}
                placeholder="Body"
                onChange={(e) =>
                  onChange({ ...block, items: block.items.map((x) => (x.id === it.id ? { ...x, body: e.target.value } : x)) })
                }
                rows={2}
                className="input mt-2"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ ...block, items: [...block.items, { id: uid("a"), title: "New item", body: "" }] })}
            className="rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted hover:bg-surface-2"
          >
            + Add item
          </button>
        </div>
      );

    case "flip-card":
      return (
        <div className="space-y-3">
          <Row label="Heading">
            <input value={block.heading ?? ""} onChange={(e) => onChange({ ...block, heading: e.target.value })} className="input" />
          </Row>
          {block.cards.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <input
                value={c.front}
                placeholder="Front"
                onChange={(e) =>
                  onChange({ ...block, cards: block.cards.map((x) => (x.id === c.id ? { ...x, front: e.target.value } : x)) })
                }
                className="input"
              />
              <span className="text-muted">/</span>
              <input
                value={c.back}
                placeholder="Back"
                onChange={(e) =>
                  onChange({ ...block, cards: block.cards.map((x) => (x.id === c.id ? { ...x, back: e.target.value } : x)) })
                }
                className="input"
              />
              <button
                type="button"
                aria-label="Remove"
                onClick={() => onChange({ ...block, cards: block.cards.filter((x) => x.id !== c.id) })}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-danger hover:bg-danger-tint"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ ...block, cards: [...block.cards, { id: uid("f"), front: "Term", back: "Definition" }] })}
            className="rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted hover:bg-surface-2"
          >
            + Add card
          </button>
        </div>
      );

    case "video":
      return (
        <div className="space-y-3">
          <Row label="Heading">
            <input value={block.heading ?? ""} onChange={(e) => onChange({ ...block, heading: e.target.value })} className="input" />
          </Row>
          <Row label="Source">
            <select
              value={block.source}
              onChange={(e) => onChange({ ...block, source: e.target.value as "youtube" | "url" | "embed" })}
              className="input"
            >
              <option value="youtube">YouTube</option>
              <option value="url">Direct video URL (mp4/webm)</option>
              <option value="embed">Embed code (iframe)</option>
            </select>
          </Row>
          <Row
            label={
              block.source === "youtube"
                ? "YouTube URL or video ID"
                : block.source === "url"
                  ? "Video file URL"
                  : "Paste the <iframe> embed code"
            }
          >
            <textarea value={block.value} onChange={(e) => onChange({ ...block, value: e.target.value })} rows={block.source === "embed" ? 3 : 1} className="input" />
          </Row>
          <Row label="Caption (optional)">
            <input value={block.caption ?? ""} onChange={(e) => onChange({ ...block, caption: e.target.value })} className="input" />
          </Row>
        </div>
      );

    case "knowledge-check":
      return (
        <div className="space-y-3">
          <Row label="Heading">
            <input value={block.heading ?? ""} onChange={(e) => onChange({ ...block, heading: e.target.value })} className="input" />
          </Row>
          <QuizEditor quiz={block.quiz} onChange={(quiz) => onChange({ ...block, quiz })} />
        </div>
      );
  }
}
