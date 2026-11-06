"use server";
import { revalidatePath } from "next/cache";
import { randomUUID, createHash } from "node:crypto";
import sharp from "sharp";
import { requireAdmin } from "@/lib/admin";
import { prepareGalleryImage } from "@/lib/gallery-image";
import { parseMutation, libraryFields, normalizeEmbedding } from "@/lib/funny/validation";
import { adminData } from "@/lib/funny/data";
import { probeModel } from "@/lib/funny/model-probe";
import type { Configuration, LibrarySnapshot } from "@/lib/funny/types";
export type ActionResult = { ok?: boolean; error?: string; id?: string; message?: string };
export async function operate(form: FormData): Promise<ActionResult> {
  const { client } = await requireAdmin();
  try {
    const { action, id, data } = parseMutation(form);
    if (action === "model_activate") {
      const config = await adminData<Configuration>("configuration");
      const model = config.models.find(m => m.id === id && m.enabled);
      if (!model) return { error: "Choose an enabled model." };
      const key = process.env.GEMINI_API_KEY;
      if (!key) return { error: "The Gemini connection is not configured." };
      await probeModel(model.model_id, key);
      data.expected_model_id = model.model_id;
    }
    const args = { p_action: action, p_id: id, p_data: data };
    const { data: result, error } = action.startsWith("taste_")
      ? await client.rpc("funny_admin_tastes", { ...args, p_key: process.env.HUMOR_WRITER_KEY })
      : await client.rpc("funny_admin_mutate", args);
    if (error) return { error: /selected|active|not found|caption|words|examples|model|taste|referenced|limit/i.test(error.message) ? error.message.slice(0, 240) : "This change could not be saved. Please retry." };
    revalidatePath("/admin", "layout");
    return { ok: true, id: result?.id, message: action === "library_delete" ? "Image retired from retrieval. Existing history is preserved." : "Saved." };
  } catch (e) { return { error: e instanceof Error ? e.message : "Check the fields and try again." }; }
}
export async function saveLibrary(form: FormData): Promise<ActionResult> {
  const { client } = await requireAdmin();
  let uploaded: string | undefined;
  try {
    const fields = libraryFields(form);
    const key = process.env.GEMINI_API_KEY;
    if (!key) return { error: "Image indexing is unavailable. Ask the operator to configure the Gemini connection." };
    let old: LibrarySnapshot["images"][number] | undefined;
    if (fields.id) {
      old = (await adminData<LibrarySnapshot>("library", 1, "", fields.id)).images.find(i => i.id === fields.id);
      if (!old) return { error: "This image is no longer available." };
    }
    const photo = form.get("photo");
    let bytes: Buffer | undefined;
    if (photo instanceof File && photo.size) bytes = await prepareGalleryImage(photo, 2 * 1024 * 1024);
    if (!old && !bytes) return { error: "Choose a JPEG, PNG, or WebP image up to 2 MB." };
    if (old && bytes) return { error: "Upload a new image record to keep existing meme history intact." };
    const signal = AbortSignal.timeout(20000);
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents", {
      method: "POST", signal, headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ requests: [{ model: "models/gemini-embedding-001", content: { parts: [{ text: `${fields.description}\n${fields.affordances}` }] }, taskType: "RETRIEVAL_DOCUMENT", outputDimensionality: 768 }] }),
    });
    if (!response.ok) return { error: "Indexing could not finish. Your existing image is unchanged; try again." };
    const result = await response.json();
    const vector = normalizeEmbedding(result.embeddings?.[0]?.values);
    const metadata = bytes ? await sharp(bytes).metadata() : undefined;
    const id = fields.id || randomUUID();
    const storagePath = old?.storage_path || `managed/${id}.jpg`;
    const family = bytes ? createHash("sha256").update(bytes).digest("hex") : old?.family;
    if (bytes) {
      const { error } = await client.storage.from("funny-library").upload(storagePath, bytes, { contentType: "image/jpeg", cacheControl: "0", upsert: false });
      if (error) return { error: "The image could not be stored. Please retry." };
      uploaded = storagePath;
    }
    const data = { description: fields.description, affordances: fields.affordances, available: fields.available, storage_path: storagePath, width: metadata?.width ?? old?.width, height: metadata?.height ?? old?.height, family, embedding: vector, index_version: "teaching-1-gemini-001-768", description_origin: old?.description_origin || "backfill" };
    const { error } = await client.rpc("funny_admin_mutate", { p_action: "library_save", p_id: id, p_data: data });
    if (error) throw new Error("The image record could not be saved. Please retry.");
    revalidatePath("/admin", "layout");
    return { ok: true, id, message: fields.available ? "Image saved and indexed for new retrievals." : "Image saved and indexed. It remains unavailable to new retrievals." };
  } catch (e) {
    if (uploaded) await client.storage.from("funny-library").remove([uploaded]);
    return { error: e instanceof Error && !/fetch|aborted/i.test(e.message) ? e.message : "Indexing took too long. Your existing record is unchanged." };
  }
}
