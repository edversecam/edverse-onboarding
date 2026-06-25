"use client";

import { useRef } from "react";
import { Block, KnowledgeCheckBlock, Quiz, SlideBlock, blockQuizzes } from "@/lib/types";
import { uid } from "@/lib/store";
import { newQuiz } from "@/lib/factories";
import { cn } from "@/lib/utils";
import { QuizEditor } from "./QuizEditor";
import { ImageUpload } from "./ImageUpload";
import { RichTextEditor } from "./RichTextEditor";
import { DragHandle, useSortable } from "./Sortable";
import { CopyIcon, TrashIcon } from "./Icons";

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
          <Row label="Body">
            <RichTextEditor value={block.body} onChange={(html) => onChange({ ...block, body: html })} minRows={5} />
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
            <RichTextEditor value={block.body} onChange={(html) => onChange({ ...block, body: html })} minRows={4} />
          </Row>
          <Row label="Image">
            <ImageUpload
              value={block.imageUrl}
              onChange={(url) => onChange({ ...block, imageUrl: url })}
            />
          </Row>
          <div className="grid gap-3 sm:grid-cols-2">
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
            <Row label="Alt text">
              <input value={block.imageAlt ?? ""} onChange={(e) => onChange({ ...block, imageAlt: e.target.value })} className="input" />
            </Row>
          </div>
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
            <RichTextEditor value={block.body} onChange={(html) => onChange({ ...block, body: html })} minRows={3} />
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
                  <TrashIcon />
                </button>
              </div>
              <div className="mt-2">
                <RichTextEditor
                  value={it.body}
                  minRows={2}
                  onChange={(html) =>
                    onChange({ ...block, items: block.items.map((x) => (x.id === it.id ? { ...x, body: html } : x)) })
                  }
                />
              </div>
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
                <TrashIcon />
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

    case "slide":
      return <SlideListEditor block={block} onChange={onChange} />;

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
      return <KnowledgeCheckEditor block={block} onChange={onChange} />;
  }
}

function KnowledgeCheckEditor({
  block,
  onChange,
}: {
  block: KnowledgeCheckBlock;
  onChange: (b: Block) => void;
}) {
  const quizzes = blockQuizzes(block);
  const quizzesRef = useRef<Quiz[]>(quizzes);
  quizzesRef.current = quizzes;
  const setQuizzes = (qs: Quiz[]) => onChange({ ...block, quizzes: qs, quiz: undefined });

  const sort = useSortable((draggedId, targetId) => {
    const arr = quizzesRef.current;
    const from = arr.findIndex((q) => q.id === draggedId);
    const to = arr.findIndex((q) => q.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...arr];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setQuizzes(next);
  });

  return (
    <div className="space-y-3">
      <Row label="Heading">
        <input value={block.heading ?? ""} onChange={(e) => onChange({ ...block, heading: e.target.value })} className="input" />
      </Row>
      {quizzes.map((q, i) => (
        <div
          key={q.id}
          {...sort.dropProps(q.id)}
          className={cn(
            "rounded-lg border bg-surface-2/40 p-3 transition",
            sort.isDragging(q.id) && "opacity-50",
            sort.isOver(q.id) ? "border-brand" : "border-border"
          )}
        >
          <div className="mb-2 flex items-center gap-2">
            <DragHandle label="Drag to reorder quiz" small {...sort.handleProps(q.id)} />
            <span className="rounded-md bg-brand-tint px-2 py-0.5 text-xs font-semibold text-brand-700">
              Quiz {i + 1}
            </span>
            <button
              type="button"
              aria-label="Remove quiz"
              disabled={quizzes.length <= 1}
              onClick={() => setQuizzes(quizzes.filter((x) => x.id !== q.id))}
              className="ml-auto grid h-7 w-7 place-items-center rounded-md border border-border text-danger transition hover:bg-danger-tint disabled:opacity-30"
            >
              <TrashIcon />
            </button>
          </div>
          <QuizEditor
            quiz={q}
            onChange={(nq) => setQuizzes(quizzesRef.current.map((x) => (x.id === q.id ? nq : x)))}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => setQuizzes([...quizzes, newQuiz("multiple-choice")])}
        className="rounded-lg border border-dashed border-border px-3 py-1.5 text-sm font-semibold text-muted transition hover:bg-surface-2"
      >
        + Add quiz
      </button>
    </div>
  );
}

function SlideListEditor({
  block,
  onChange,
}: {
  block: SlideBlock;
  onChange: (b: Block) => void;
}) {
  const slidesRef = useRef(block.slides);
  slidesRef.current = block.slides;

  const sort = useSortable((draggedId, targetId) => {
    const arr = slidesRef.current;
    const from = arr.findIndex((s) => s.id === draggedId);
    const to = arr.findIndex((s) => s.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...arr];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange({ ...block, slides: next });
  });

  return (
    <div className="space-y-3">
      <Row label="Heading">
        <input value={block.heading ?? ""} onChange={(e) => onChange({ ...block, heading: e.target.value })} className="input" />
      </Row>
      {block.slides.map((s, idx) => (
        <div
          key={s.id}
          {...sort.dropProps(s.id)}
          className={cn(
            "rounded-lg border p-3 transition",
            sort.isDragging(s.id) && "opacity-50",
            sort.isOver(s.id) ? "border-brand" : "border-border"
          )}
        >
          <div className="mb-2 flex items-center gap-2">
            <DragHandle label="Drag to reorder slide" small {...sort.handleProps(s.id)} />
            <span className="rounded-md bg-brand-tint px-2 py-0.5 text-xs font-semibold text-brand-700">
              Slide {idx + 1}
            </span>
            <button
              type="button"
              aria-label="Duplicate slide"
              title="Duplicate slide"
              onClick={() => {
                const clone = structuredClone(s);
                clone.id = uid("s");
                const next = [...block.slides];
                next.splice(idx + 1, 0, clone);
                onChange({ ...block, slides: next });
              }}
              className="ml-auto grid h-7 w-7 place-items-center rounded-md border border-border text-muted hover:bg-surface-2"
            >
              <CopyIcon />
            </button>
            <button
              type="button"
              aria-label="Remove slide"
              onClick={() => onChange({ ...block, slides: block.slides.filter((x) => x.id !== s.id) })}
              className="grid h-7 w-7 place-items-center rounded-md border border-border text-danger hover:bg-danger-tint"
            >
              <TrashIcon />
            </button>
          </div>
          <input
            value={s.title ?? ""}
            placeholder="Slide title"
            onChange={(e) => onChange({ ...block, slides: block.slides.map((x) => (x.id === s.id ? { ...x, title: e.target.value } : x)) })}
            className="input font-semibold"
          />
          <div className="mt-2">
            <RichTextEditor
              value={s.body}
              minRows={3}
              onChange={(html) => onChange({ ...block, slides: block.slides.map((x) => (x.id === s.id ? { ...x, body: html } : x)) })}
            />
          </div>
          <input
            value={s.imageUrl ?? ""}
            placeholder="Slide URL (optional) — image shown on this slide"
            onChange={(e) => onChange({ ...block, slides: block.slides.map((x) => (x.id === s.id ? { ...x, imageUrl: e.target.value } : x)) })}
            className="input mt-2"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...block, slides: [...block.slides, { id: uid("s"), title: `Slide ${block.slides.length + 1}`, body: "" }] })}
        className="rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted hover:bg-surface-2"
      >
        + Add slide
      </button>
    </div>
  );
}
