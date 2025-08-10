// Supabase Edge Function: Open Graph HTML generator for link previews
// Returns a minimal HTML page with OG/Twitter meta tags based on query params
// Usage:
//   /functions/v1/og?title=...&description=...&image=...&redirect=...
// Note: iMessage/Twitter/FB fetch this HTML (no JS execution), so this guarantees correct previews.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

function esc(str: string | null | undefined) {
  return (str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

serve(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "Aura — Your mood is your gallery";
    const description = searchParams.get("description") || "Aura: Share and discover digital art by vibe.";
    const image = searchParams.get("image") || "https://preview--aura-mood-gallery.lovable.app/lovable-uploads/c01519dd-0698-4c23-b3a7-e5af5415a354.png";
    const redirect = searchParams.get("redirect") || "https://preview--aura-mood-gallery.lovable.app/";
    const canonical = searchParams.get("canonical") || redirect;

    // Basic content-type detection by extension
    const lower = image.toLowerCase();
    const imgType = lower.endsWith(".png")
      ? "image/png"
      : lower.endsWith(".gif")
      ? "image/gif"
      : lower.endsWith(".webp")
      ? "image/webp"
      : "image/jpeg";

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <link rel="canonical" href="${esc(canonical)}" />
  <meta name="description" content="${esc(description)}" />

  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:site_name" content="Aura" />
  <meta property="og:image" content="${esc(image)}" />
  <meta property="og:image:secure_url" content="${esc(image)}" />
  <meta property="og:image:type" content="${imgType}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(image)}" />

  <meta http-equiv="refresh" content="0; url=${esc(redirect)}" />
</head>
<body>
  <p>Redirecting to <a href="${esc(redirect)}">${esc(redirect)}</a>…</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        // Allow bots/CDNs to cache for a while to reduce edge load
        "Cache-Control": "public, max-age=600",
      },
    });
  } catch (e) {
    return new Response(`Error: ${e instanceof Error ? e.message : String(e)}` , { status: 500 });
  }
});
