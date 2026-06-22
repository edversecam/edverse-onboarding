"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uid } from "@/lib/store";
import { cn } from "@/lib/utils";

const BUCKET = "course-images";

export function ImageUpload({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const upload = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image is larger than 5 MB.");
      return;
    }
    setBusy(true);
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `uploads/${uid("img")}.${ext}`;
      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    }
    setBusy(false);
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Selected"
            className="h-16 w-24 shrink-0 rounded-md border border-border object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted">{value}</p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-surface-2"
          >
            {busy ? "Uploading…" : "Replace"}
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger-tint"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) upload(f);
          }}
          className={cn(
            "flex w-full flex-col items-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-6 text-sm transition",
            dragOver
              ? "border-brand bg-brand-tint/40"
              : "border-border bg-surface-2/40 hover:bg-surface-2"
          )}
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 16V4m0 0L8 8m4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
          </svg>
          <span className="font-semibold text-foreground">
            {busy ? "Uploading…" : "Upload an image"}
          </span>
          <span className="text-xs text-muted">Click or drag a file here · PNG, JPG, WEBP up to 5 MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />

      {error && (
        <p className="rounded-lg bg-danger-tint px-3 py-2 text-xs text-danger">{error}</p>
      )}

      <button
        type="button"
        onClick={() => setShowUrl((s) => !s)}
        className="text-xs font-medium text-muted hover:text-brand-700"
      >
        {showUrl ? "Hide URL field" : "Or paste an image URL"}
      </button>
      {showUrl && (
        <input
          value={value ?? ""}
          placeholder="https://…"
          onChange={(e) => onChange(e.target.value)}
          className="input"
        />
      )}
    </div>
  );
}
