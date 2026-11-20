import { createClient } from "@/lib/supabase/server";
import { failure } from "@/lib/cowriter/server";
import { postInput } from "@/lib/gallery/contracts";
import { sharedImage, sharedBytes } from "@/lib/gallery/server";
import { galleryThumbnail } from "@/lib/gallery/thumbnail";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const { id } = postInput.parse(Object.fromEntries(params));
    const client = await createClient();
    const media = await sharedImage(client, id);
    if (params.get("size") === "card") {
      const etag = '"card-v1-' + id + '"';
      const headers = { "Content-Type": "image/webp", "Cache-Control": "private, no-cache", ETag: etag, "X-Content-Type-Options": "nosniff" };
      if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });
      const image = await galleryThumbnail(media.bucket + "/" + media.path, () => sharedBytes(client, media));
      return new Response(new Uint8Array(image), { headers });
    }
    return new Response(new Uint8Array(await sharedBytes(client, media)), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
    });
  } catch (error) { return failure(error); }
}
