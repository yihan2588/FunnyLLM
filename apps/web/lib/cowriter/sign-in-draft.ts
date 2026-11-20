import { z } from "zod";

const key = "funnyllm:sign-in-draft";
const fields = z.object({
  mode: z.enum(["pic", "thought"]),
  thought: z.string().max(700),
  spirit: z.string().max(700),
  locks: z.string().max(240),
  hadPhoto: z.boolean(),
  savedAt: z.number(),
});
type Draft = z.infer<typeof fields>;

export function rememberDraft(storage: Storage, draft: Omit<Draft, "savedAt">) {
  storage.setItem(key, JSON.stringify({ ...draft, savedAt: Date.now() }));
}

export function restoreDraft(storage: Storage, mode: Draft["mode"], signedIn: boolean) {
  const raw = storage.getItem(key);
  if (!raw) return;
  let value: unknown;
  try { value = JSON.parse(raw); } catch { /* Discard malformed or obsolete entries. */ }
  const parsed = fields.safeParse(value);
  if (!parsed.success || Date.now() - parsed.data.savedAt > 30 * 60_000) {
    storage.removeItem(key);
    return;
  }
  if (mode !== parsed.data.mode) return;
  if (signedIn) storage.removeItem(key);
  return parsed.data;
}
