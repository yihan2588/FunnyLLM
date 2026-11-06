import fontWidths from "./font-widths.json" with { type: "json" };
export const isUuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const field = (form: FormData, name: string, max: number, min = 1) => {
  const value = form.get(name);
  if (typeof value !== "string" || value.trim().length < min || value.trim().length > max || /[\u0000-\u0008]/.test(value)) throw new Error(`Check ${name.replaceAll("_", " ")}.`);
  return value.trim();
};
const checked = (form: FormData, name: string) => form.get(name) === "on" || form.get(name) === "true";
export function parseMutation(form: FormData) {
  const action = field(form, "action", 40);
  const rawId = form.get("id");
  const id = rawId ? isUuid(rawId) ? rawId : null : null;
  if (rawId && !id) throw new Error("The selected record is invalid.");
  let data: Record<string, unknown> = {};
  switch (action) {
    case "writing_enabled": data = { enabled: checked(form, "enabled") }; break;
    case "post_feature": data = { featured: checked(form, "featured") }; break;
    case "post_remove": data = { reason: field(form, "reason", 500, 5) }; break;
    case "example_save": {
      const caption = field(form, "caption", 200);
      if (caption.split(/\s+/u).length > 20 || /[\r\n]/.test(caption)) throw new Error("Use a single caption of at most 20 words.");
      if (!Array.from(caption).every(c => Object.hasOwn(fontWidths, c))) throw new Error("Use Latin letters and supported punctuation in example captions; the meme font does not support emoji.");
      data = { intent: field(form, "intent", 400), image_description: field(form, "image_description", 1500), caption, enabled: checked(form, "enabled") };
      break;
    }
    case "taste_save": {
      const emoji = field(form, "emoji", 64);
      if (!new RegExp("^\\p{RGI_Emoji}$", "v").test(emoji)) throw new Error("Choose one standard emoji.");
      data = { emoji, label: field(form, "label", 24), prompt: field(form, "prompt", 600) };
      break;
    }
    case "taste_delete": break;
    case "model_save": {
      const model = field(form, "model_id", 100);
      if (!/^gemini-[a-z0-9][a-z0-9.-]{1,90}$/.test(model)) throw new Error("Use a Gemini model ID such as gemini-3.1-flash-lite.");
      data = { label: field(form, "label", 80), model_id: model, enabled: checked(form, "enabled") };
      break;
    }
    case "post_restore": case "report_resolve": case "example_delete": case "model_delete": case "model_activate": case "library_delete": break;
    default: throw new Error("This action is not supported.");
  }
  if (!["writing_enabled", "example_save", "model_save", "taste_save"].includes(action) && !id) throw new Error("Choose a record first.");
  if (["post_remove", "example_delete", "model_delete", "library_delete", "taste_delete"].includes(action) && !checked(form, "confirm")) throw new Error("Confirm this change before saving.");
  return { action, id, data };
}
export function libraryFields(form: FormData) {
  const rawId = form.get("id");
  if (rawId && !isUuid(rawId)) throw new Error("Choose a valid image.");
  return { id: rawId as string | null, description: field(form, "description", 4000, 3), affordances: field(form, "affordances", 2000, 0), available: checked(form, "available") };
}
export function normalizeEmbedding(values: unknown): number[] {
  if (!Array.isArray(values) || values.length !== 768 || values.some(v => typeof v !== "number" || !Number.isFinite(v))) throw new Error("The image index returned an invalid vector.");
  const norm = Math.hypot(...values);
  if (!norm) throw new Error("The image index returned an empty vector.");
  return values.map(v => v / norm);
}
export const queryPage = (value: unknown) => typeof value === "string" && /^\d+$/.test(value) ? Math.max(1, Math.min(10000, Number(value))) : 1;
export const queryText = (value: unknown) => typeof value === "string" ? value.trim().slice(0, 120) : "";
