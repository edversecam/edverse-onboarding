import { Fragment } from "react";

/**
 * Minimal, dependency-free renderer for the lightweight markup authors type
 * into block bodies. Supports blank-line paragraphs, `- ` bullet lists, and
 * inline **bold** / *italic*. (Author input only — not untrusted HTML.)
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = text.trim().split(/\n\s*\n/);
  return (
    <div className={className}>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => l.trim().startsWith("- "));
        if (isList) {
          return (
            <ul key={i} className="my-2 list-disc space-y-1 pl-5 text-foreground/90">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.trim().slice(2))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="my-2 leading-7 text-foreground/90">
            {inline(block)}
          </p>
        );
      })}
    </div>
  );
}

function inline(text: string): React.ReactNode {
  // Split on **bold** and *italic* while keeping delimiters.
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return tokens.map((t, i) => {
    if (t.startsWith("**") && t.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {t.slice(2, -2)}
        </strong>
      );
    }
    if (t.startsWith("*") && t.endsWith("*")) {
      return <em key={i}>{t.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{t}</Fragment>;
  });
}
