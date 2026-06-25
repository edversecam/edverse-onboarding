// Returns the ordered slide page IDs for a public Google Slides deck so the
// learner view can render each slide as its own image. Requires a Google
// Slides API key (GOOGLE_SLIDES_API_KEY) and the deck shared "Anyone with the
// link can view". On any failure it returns an empty list so the client falls
// back to showing the deck's first slide only — it never throws to the learner.

const SLIDES_API = "https://slides.googleapis.com/v1/presentations";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ pageIds: [], reason: "missing-id" }, { status: 400 });

  const key = process.env.GOOGLE_SLIDES_API_KEY;
  if (!key) return Response.json({ pageIds: [], reason: "no-api-key" });

  try {
    const res = await fetch(
      `${SLIDES_API}/${encodeURIComponent(id)}?fields=slides(objectId)&key=${key}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) {
      return Response.json({ pageIds: [], reason: `upstream-${res.status}` });
    }
    const data: { slides?: { objectId?: string }[] } = await res.json();
    const pageIds = (data.slides ?? [])
      .map((s) => s.objectId)
      .filter((x): x is string => Boolean(x));
    return Response.json({ pageIds });
  } catch {
    return Response.json({ pageIds: [], reason: "fetch-error" });
  }
}
