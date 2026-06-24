"use client";

import { useEffect, useRef } from "react";

const FONTS = [
  { label: "Default", value: "" },
  { label: "Sans (Inter)", value: "var(--font-inter), system-ui, sans-serif" },
  { label: "Serif (Lora)", value: "var(--font-lora), Georgia, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Monospace", value: "ui-monospace, Menlo, monospace" },
];

// execCommand fontSize uses 1–7; with styleWithCSS these map to CSS keywords.
const SIZES = [
  { label: "Small", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Large", value: "5" },
  { label: "Huge", value: "7" },
];

export function RichTextEditor({
  value,
  onChange,
  minRows = 4,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  minRows?: number;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);

  // Set initial content once.
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external changes only when the editor isn't being typed into.
  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.innerHTML !== (value || "")) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const emit = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };
  const saveSel = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && ref.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0);
    }
  };
  const restoreSel = () => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };
  const exec = (cmd: string, val?: string) => {
    try {
      document.execCommand("styleWithCSS", false, "true");
    } catch {
      /* ignore */
    }
    document.execCommand(cmd, false, val);
    emit();
  };
  // Used by the dropdowns, which steal focus when opened.
  const execFromMenu = (cmd: string, val: string) => {
    restoreSel();
    exec(cmd, val);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface-2/40 p-1.5">
        <select
          aria-label="Format"
          className="rte-select"
          value=""
          onMouseDown={saveSel}
          onChange={(e) => execFromMenu("formatBlock", e.target.value)}
        >
          <option value="" disabled>
            Paragraph
          </option>
          <option value="P">Paragraph</option>
          <option value="H1">Heading 1</option>
          <option value="H2">Heading 2</option>
          <option value="H3">Heading 3</option>
        </select>

        <select
          aria-label="Font"
          className="rte-select"
          value=""
          onMouseDown={saveSel}
          onChange={(e) => execFromMenu("fontName", e.target.value)}
        >
          <option value="" disabled>
            Font
          </option>
          {FONTS.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Font size"
          className="rte-select"
          value=""
          onMouseDown={saveSel}
          onChange={(e) => execFromMenu("fontSize", e.target.value)}
        >
          <option value="" disabled>
            Size
          </option>
          {SIZES.map((s) => (
            <option key={s.label} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <Sep />
        <Btn label="Bold" onClick={() => exec("bold")}>
          <span className="font-bold">B</span>
        </Btn>
        <Btn label="Italic" onClick={() => exec("italic")}>
          <span className="italic font-serif">I</span>
        </Btn>
        <Btn label="Underline" onClick={() => exec("underline")}>
          <span className="underline">U</span>
        </Btn>

        <Sep />
        <Btn label="Bullet list" onClick={() => exec("insertUnorderedList")}>
          <Icon d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
        </Btn>
        <Btn label="Numbered list" onClick={() => exec("insertOrderedList")}>
          <Icon d="M10 6h11M10 12h11M10 18h11M4 4v4M3 8h2M3 12h2l-2 2.5h2" />
        </Btn>
        <Btn label="Quote" onClick={() => exec("formatBlock", "BLOCKQUOTE")}>
          <span className="font-serif text-lg leading-none">&rdquo;</span>
        </Btn>

        <Sep />
        <Btn label="Align left" onClick={() => exec("justifyLeft")}>
          <Icon d="M4 6h16M4 12h10M4 18h13" />
        </Btn>
        <Btn label="Align center" onClick={() => exec("justifyCenter")}>
          <Icon d="M4 6h16M7 12h10M5 18h14" />
        </Btn>
        <Btn label="Align right" onClick={() => exec("justifyRight")}>
          <Icon d="M4 6h16M10 12h10M7 18h13" />
        </Btn>

        <Sep />
        <Btn
          label="Add link"
          onClick={() => {
            const url = window.prompt("Link URL (https://…)");
            if (url) exec("createLink", url);
          }}
        >
          <Icon d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
        </Btn>
        <Btn label="Remove link" onClick={() => exec("unlink")}>
          <Icon d="M18.5 8.5 21 6a3 3 0 0 0-4-4l-2.5 2.5M5.5 15.5 3 18a3 3 0 0 0 4 4l2.5-2.5M4 4l16 16" />
        </Btn>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={() => {
          saveSel();
          emit();
        }}
        onMouseUp={saveSel}
        onKeyUp={saveSel}
        className="rich-content w-full px-3 py-2.5 text-[15px] outline-none"
        style={{ minHeight: `${minRows * 1.7}rem` }}
      />
    </div>
  );
}

function Btn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="rte-btn"
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-border" />;
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
