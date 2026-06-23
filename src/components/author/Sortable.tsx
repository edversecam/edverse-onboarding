"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Native HTML5 drag-and-drop reordering. `onReorder` moves the dragged item
 *  to the position of the target item. */
export function useSortable(onReorder: (draggedId: string, targetId: string) => void) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  return {
    isDragging: (id: string) => dragId === id,
    isOver: (id: string) => overId === id && !!dragId && dragId !== id,
    /** Spread onto the container of each item (the drop target). */
    dropProps: (id: string) => ({
      "data-sortable": id,
      onDragOver: (e: React.DragEvent) => {
        if (dragId && dragId !== id) {
          e.preventDefault();
          setOverId(id);
        }
      },
      onDragLeave: () => setOverId((o) => (o === id ? null : o)),
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        if (dragId && dragId !== id) onReorder(dragId, id);
        setDragId(null);
        setOverId(null);
      },
    }),
    /** Spread onto the drag handle inside each item. */
    handleProps: (id: string) => ({
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        setDragId(id);
        const row = (e.currentTarget as HTMLElement).closest("[data-sortable]");
        if (row) e.dataTransfer.setDragImage(row, 16, 16);
        e.dataTransfer.effectAllowed = "move";
      },
      onDragEnd: () => {
        setDragId(null);
        setOverId(null);
      },
    }),
  };
}

export function DragHandle({
  label,
  small,
  className,
  ...drag
}: {
  label: string;
  small?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement> & { draggable?: boolean }) {
  return (
    <span
      aria-label={label}
      title="Drag to reorder"
      {...drag}
      className={cn(
        "grid shrink-0 cursor-grab place-items-center rounded-md text-muted transition hover:bg-surface-2 hover:text-foreground active:cursor-grabbing",
        small ? "h-7 w-6" : "h-8 w-7",
        className
      )}
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden>
        <circle cx="5" cy="4" r="1.3" />
        <circle cx="11" cy="4" r="1.3" />
        <circle cx="5" cy="8" r="1.3" />
        <circle cx="11" cy="8" r="1.3" />
        <circle cx="5" cy="12" r="1.3" />
        <circle cx="11" cy="12" r="1.3" />
      </svg>
    </span>
  );
}
