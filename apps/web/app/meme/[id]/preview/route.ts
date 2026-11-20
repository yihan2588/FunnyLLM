import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/navigation";
import { sharedImage, sharedBytes } from "@/lib/gallery/server";
import { renderMeme } from "@/lib/cowriter/render";
import { failure } from "@/lib/cowriter/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) return new Response(null, { status: 404 });
  try {
    // Resolve every social preview as a gallery visitor, including requests from owners.
    const client = await createClient({ anonymous: true });
    const media = await sharedImage(client, id);
    const meme = await renderMeme(await sharedBytes(client, media), media.caption);
    const card = await sharp(meme).resize(1200, 630, { fit: "contain", background: "#faf8ee" }).png().toBuffer();
    return new Response(new Uint8Array(card), {
      headers: { "Content-Type": "image/png", "Cache-Control": "private, no-store" },
    });
  } catch (error) { return failure(error); }
}
