import { VideoBlock as VideoBlockT } from "@/lib/types";

/** Pull a YouTube video id out of a full URL or accept a bare id. */
function youtubeId(value: string): string {
  const v = value.trim();
  const m = v.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/
  );
  if (m) return m[1];
  return v; // assume it's already an id
}

export function VideoBlock({ block }: { block: VideoBlockT }) {
  return (
    <figure>
      <div className="overflow-hidden rounded-xl border border-border bg-black shadow-[var(--shadow-card)]">
        <div className="relative aspect-video w-full">
          {block.source === "youtube" && (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${youtubeId(block.value)}`}
              title={block.heading ?? "Video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}

          {block.source === "url" && (
            <video
              className="absolute inset-0 h-full w-full"
              src={block.value}
              controls
              preload="metadata"
            />
          )}

          {block.source === "embed" && (
            <div
              className="absolute inset-0 h-full w-full [&>iframe]:h-full [&>iframe]:w-full"
              // Author-provided embed markup (e.g. Vimeo/Loom iframe).
              dangerouslySetInnerHTML={{ __html: block.value }}
            />
          )}
        </div>
      </div>
      {block.caption && (
        <figcaption className="mt-2 text-center text-sm text-muted">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}
