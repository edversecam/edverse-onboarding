"use client";

import { useState } from "react";
import { saveCourse } from "@/lib/store";
import { cn } from "@/lib/utils";

type Status = "idle" | "saving" | "saved" | "error";

export function SaveButton({ courseId }: { courseId: string }) {
  const [status, setStatus] = useState<Status>("idle");

  const onSave = async () => {
    setStatus("saving");
    const ok = await saveCourse(courseId);
    setStatus(ok ? "saved" : "error");
    if (ok) setTimeout(() => setStatus("idle"), 2000);
  };

  const label =
    status === "saving"
      ? "Saving…"
      : status === "saved"
        ? "Saved"
        : status === "error"
          ? "Retry save"
          : "Save";

  return (
    <button
      type="button"
      onClick={onSave}
      disabled={status === "saving"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-70",
        status === "saved"
          ? "bg-success"
          : status === "error"
            ? "bg-danger"
            : "bg-brand hover:bg-brand-600"
      )}
    >
      {status === "saved" ? (
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
          <path d="M8 13.2 4.8 10l-1.3 1.3L8 15.8l8-8-1.3-1.3z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 4h11l3 3v13H5z" strokeLinejoin="round" />
          <path d="M9 4v5h6M8 20v-6h8v6" strokeLinejoin="round" />
        </svg>
      )}
      {label}
    </button>
  );
}
