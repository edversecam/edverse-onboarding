"use client";

import { useState } from "react";
import { AccordionBlock as AccordionBlockT } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RichText } from "./RichText";

export function AccordionBlock({ block }: { block: AccordionBlockT }) {
  const [open, setOpen] = useState<string | null>(block.items[0]?.id ?? null);
  return (
    <div className="space-y-2">
      {block.items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-xl border border-border bg-surface"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold text-foreground transition hover:bg-surface-2"
              aria-expanded={isOpen}
            >
              {item.title}
              <span
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-tint text-brand-700 transition-transform",
                  isOpen && "rotate-45"
                )}
              >
                +
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-200",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-4 text-sm">
                  <RichText text={item.body} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
