"use client";

import {
  DragDropQuiz,
  FillGapQuiz,
  MatchingQuiz,
  MultipleAnswerQuiz,
  MultipleChoiceQuiz,
  OrderingQuiz,
  Quiz,
  QuizKind,
  TrueFalseQuiz,
} from "@/lib/types";
import { QUIZ_LABELS, newQuiz } from "@/lib/factories";
import { uid } from "@/lib/store";

export function QuizEditor({
  quiz,
  onChange,
}: {
  quiz: Quiz;
  onChange: (q: Quiz) => void;
}) {
  return (
    <div className="space-y-3">
      <Row label="Quiz type">
        <select
          value={quiz.kind}
          onChange={(e) => onChange(newQuiz(e.target.value as QuizKind))}
          className="input"
        >
          {(Object.keys(QUIZ_LABELS) as QuizKind[]).map((k) => (
            <option key={k} value={k}>
              {QUIZ_LABELS[k]}
            </option>
          ))}
        </select>
      </Row>

      <Row label="Question / prompt">
        <textarea
          value={quiz.prompt}
          onChange={(e) => onChange({ ...quiz, prompt: e.target.value })}
          rows={2}
          className="input"
        />
      </Row>

      <Specific quiz={quiz} onChange={onChange} />

      <details className="rounded-lg border border-border bg-surface-2/50 px-3 py-2">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted">
          Feedback (optional)
        </summary>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <input
            placeholder="When correct…"
            value={quiz.feedbackCorrect ?? ""}
            onChange={(e) => onChange({ ...quiz, feedbackCorrect: e.target.value })}
            className="input"
          />
          <input
            placeholder="When incorrect…"
            value={quiz.feedbackIncorrect ?? ""}
            onChange={(e) =>
              onChange({ ...quiz, feedbackIncorrect: e.target.value })
            }
            className="input"
          />
        </div>
      </details>
    </div>
  );
}

function Specific({ quiz, onChange }: { quiz: Quiz; onChange: (q: Quiz) => void }) {
  switch (quiz.kind) {
    case "multiple-choice":
      return <ChoiceEditor quiz={quiz} onChange={onChange} single />;
    case "multiple-answer":
      return <ChoiceEditor quiz={quiz} onChange={onChange} />;
    case "true-false":
      return <TrueFalseEditor quiz={quiz} onChange={onChange} />;
    case "ordering":
      return <OrderingEditor quiz={quiz} onChange={onChange} />;
    case "drag-drop":
      return <DragDropEditor quiz={quiz} onChange={onChange} />;
    case "matching":
      return <MatchingEditor quiz={quiz} onChange={onChange} />;
    case "fill-gap":
      return <FillGapEditor quiz={quiz} onChange={onChange} />;
  }
}

/* ───────── Choice (MC + MA) ───────── */
function ChoiceEditor({
  quiz,
  onChange,
  single,
}: {
  quiz: MultipleChoiceQuiz | MultipleAnswerQuiz;
  onChange: (q: Quiz) => void;
  single?: boolean;
}) {
  const set = (options: typeof quiz.options) => onChange({ ...quiz, options });
  return (
    <Row label={single ? "Options (pick one correct)" : "Options (tick all correct)"}>
      <div className="space-y-2">
        {quiz.options.map((o) => (
          <div key={o.id} className="flex items-center gap-2">
            <button
              type="button"
              title="Mark correct"
              onClick={() =>
                set(
                  single
                    ? quiz.options.map((x) => ({ ...x, correct: x.id === o.id }))
                    : quiz.options.map((x) =>
                        x.id === o.id ? { ...x, correct: !x.correct } : x
                      )
                )
              }
              className={`grid h-7 w-7 shrink-0 place-items-center border ${
                single ? "rounded-full" : "rounded-md"
              } ${o.correct ? "border-success bg-success text-white" : "border-border"}`}
            >
              {o.correct ? "✓" : ""}
            </button>
            <input
              value={o.text}
              onChange={(e) =>
                set(quiz.options.map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)))
              }
              className="input"
            />
            <RemoveBtn onClick={() => set(quiz.options.filter((x) => x.id !== o.id))} />
          </div>
        ))}
        <AddBtn
          label="Add option"
          onClick={() => set([...quiz.options, { id: uid("o"), text: "New option" }])}
        />
      </div>
    </Row>
  );
}

/* ───────── True / False ───────── */
function TrueFalseEditor({
  quiz,
  onChange,
}: {
  quiz: TrueFalseQuiz;
  onChange: (q: Quiz) => void;
}) {
  return (
    <Row label="Correct answer">
      <div className="flex gap-2">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange({ ...quiz, answer: v })}
            className={`rounded-lg border px-5 py-2 text-sm font-semibold ${
              quiz.answer === v
                ? "border-brand bg-brand-tint text-brand-700"
                : "border-border hover:bg-surface-2"
            }`}
          >
            {v ? "True" : "False"}
          </button>
        ))}
      </div>
    </Row>
  );
}

/* ───────── Ordering ───────── */
function OrderingEditor({
  quiz,
  onChange,
}: {
  quiz: OrderingQuiz;
  onChange: (q: Quiz) => void;
}) {
  const set = (items: typeof quiz.items) => onChange({ ...quiz, items });
  return (
    <Row label="Items in their CORRECT order (learners see them shuffled)">
      <div className="space-y-2">
        {quiz.items.map((it, i) => (
          <div key={it.id} className="flex items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand-tint text-xs font-bold text-brand-700">
              {i + 1}
            </span>
            <input
              value={it.text}
              onChange={(e) =>
                set(quiz.items.map((x) => (x.id === it.id ? { ...x, text: e.target.value } : x)))
              }
              className="input"
            />
            <RemoveBtn onClick={() => set(quiz.items.filter((x) => x.id !== it.id))} />
          </div>
        ))}
        <AddBtn label="Add item" onClick={() => set([...quiz.items, { id: uid("o"), text: "New item" }])} />
      </div>
    </Row>
  );
}

/* ───────── Drag & drop ───────── */
function DragDropEditor({
  quiz,
  onChange,
}: {
  quiz: DragDropQuiz;
  onChange: (q: Quiz) => void;
}) {
  return (
    <>
      <Row label="Groups">
        <div className="space-y-2">
          {quiz.zones.map((z) => (
            <div key={z.id} className="flex items-center gap-2">
              <input
                value={z.label}
                onChange={(e) =>
                  onChange({
                    ...quiz,
                    zones: quiz.zones.map((x) =>
                      x.id === z.id ? { ...x, label: e.target.value } : x
                    ),
                  })
                }
                className="input"
              />
              <RemoveBtn
                onClick={() =>
                  onChange({
                    ...quiz,
                    zones: quiz.zones.filter((x) => x.id !== z.id),
                    items: quiz.items.filter((i) => i.zoneId !== z.id),
                  })
                }
              />
            </div>
          ))}
          <AddBtn
            label="Add group"
            onClick={() =>
              onChange({
                ...quiz,
                zones: [...quiz.zones, { id: uid("z"), label: "New group" }],
              })
            }
          />
        </div>
      </Row>
      <Row label="Items (assign each to a group)">
        <div className="space-y-2">
          {quiz.items.map((it) => (
            <div key={it.id} className="flex items-center gap-2">
              <input
                value={it.text}
                onChange={(e) =>
                  onChange({
                    ...quiz,
                    items: quiz.items.map((x) =>
                      x.id === it.id ? { ...x, text: e.target.value } : x
                    ),
                  })
                }
                className="input"
              />
              <select
                value={it.zoneId}
                onChange={(e) =>
                  onChange({
                    ...quiz,
                    items: quiz.items.map((x) =>
                      x.id === it.id ? { ...x, zoneId: e.target.value } : x
                    ),
                  })
                }
                className="input sm:w-44"
              >
                {quiz.zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label}
                  </option>
                ))}
              </select>
              <RemoveBtn
                onClick={() =>
                  onChange({ ...quiz, items: quiz.items.filter((x) => x.id !== it.id) })
                }
              />
            </div>
          ))}
          <AddBtn
            label="Add item"
            onClick={() =>
              onChange({
                ...quiz,
                items: [
                  ...quiz.items,
                  { id: uid("d"), text: "New item", zoneId: quiz.zones[0]?.id ?? "z1" },
                ],
              })
            }
          />
        </div>
      </Row>
    </>
  );
}

/* ───────── Matching ───────── */
function MatchingEditor({
  quiz,
  onChange,
}: {
  quiz: MatchingQuiz;
  onChange: (q: Quiz) => void;
}) {
  const set = (pairs: typeof quiz.pairs) => onChange({ ...quiz, pairs });
  return (
    <Row label="Pairs">
      <div className="space-y-2">
        {quiz.pairs.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <input
              value={p.left}
              onChange={(e) =>
                set(quiz.pairs.map((x) => (x.id === p.id ? { ...x, left: e.target.value } : x)))
              }
              className="input"
              placeholder="Left"
            />
            <span className="text-muted">→</span>
            <input
              value={p.right}
              onChange={(e) =>
                set(quiz.pairs.map((x) => (x.id === p.id ? { ...x, right: e.target.value } : x)))
              }
              className="input"
              placeholder="Right"
            />
            <RemoveBtn onClick={() => set(quiz.pairs.filter((x) => x.id !== p.id))} />
          </div>
        ))}
        <AddBtn
          label="Add pair"
          onClick={() => set([...quiz.pairs, { id: uid("p"), left: "Left", right: "Right" }])}
        />
      </div>
    </Row>
  );
}

/* ───────── Fill the gap ───────── */
function FillGapEditor({
  quiz,
  onChange,
}: {
  quiz: FillGapQuiz;
  onChange: (q: Quiz) => void;
}) {
  return (
    <>
      <Row label="Sentence — mark blanks with {{1}}, {{2}}, …">
        <textarea
          value={quiz.text}
          onChange={(e) => onChange({ ...quiz, text: e.target.value })}
          rows={2}
          className="input"
        />
      </Row>
      <Row label="Blanks (answer + comma-separated wrong words)">
        <div className="space-y-2">
          {quiz.blanks.map((b, i) => (
            <div key={b.id} className="flex items-center gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand-tint text-xs font-bold text-brand-700">
                {i + 1}
              </span>
              <input
                value={b.answer}
                placeholder="Correct word"
                onChange={(e) =>
                  onChange({
                    ...quiz,
                    blanks: quiz.blanks.map((x) =>
                      x.id === b.id ? { ...x, answer: e.target.value } : x
                    ),
                  })
                }
                className="input"
              />
              <input
                value={(b.options ?? []).join(", ")}
                placeholder="Wrong words, comma separated"
                onChange={(e) =>
                  onChange({
                    ...quiz,
                    blanks: quiz.blanks.map((x) =>
                      x.id === b.id
                        ? {
                            ...x,
                            options: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }
                        : x
                    ),
                  })
                }
                className="input"
              />
              <RemoveBtn
                onClick={() =>
                  onChange({ ...quiz, blanks: quiz.blanks.filter((x) => x.id !== b.id) })
                }
              />
            </div>
          ))}
          <AddBtn
            label="Add blank"
            onClick={() =>
              onChange({
                ...quiz,
                blanks: [...quiz.blanks, { id: uid("g"), answer: "word", options: [] }],
              })
            }
          />
        </div>
      </Row>
    </>
  );
}

/* ───────── shared bits ───────── */
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
function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted transition hover:bg-surface-2"
    >
      + {label}
    </button>
  );
}
function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Remove"
      onClick={onClick}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-danger transition hover:bg-danger-tint"
    >
      ✕
    </button>
  );
}
