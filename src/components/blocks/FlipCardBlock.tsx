"use client";

import { useState } from "react";
import { FlipCardBlock as FlipCardBlockT } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FlipCardBlock({ block }: { block: FlipCardBlockT }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {block.cards.map((card) => (
        <FlipCard key={card.id} front={card.front} back={card.back} />
      ))}
    </div>
  );
}

function FlipCard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      className="group h-44 w-full [perspective:1200px]"
      aria-pressed={flipped}
    >
      <div
        className={cn(
          "relative h-full w-full rounded-xl transition-transform duration-500 [transform-style:preserve-3d]",
          flipped && "[transform:rotateY(180deg)]"
        )}
      >
        {/* front */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface p-4 text-center shadow-[var(--shadow-card)] [backface-visibility:hidden]">
          <span className="text-base font-semibold text-foreground">{front}</span>
          <span className="text-xs text-muted">Tap to flip</span>
        </div>
        {/* back */}
        <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-brand bg-brand p-4 text-center text-sm font-medium text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {back}
        </div>
      </div>
    </button>
  );
}
