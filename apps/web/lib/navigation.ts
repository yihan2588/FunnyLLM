export const isUuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export function safeReturn(value: unknown): string {
  if (typeof value !== "string") return "/";
  if (["/", "/lab", "/creations", "/profile"].includes(value)) return value;
  if (/^\/meme\/[0-9a-f-]{36}$/.test(value)) return value;
  if (/^\/creations\?tab=(drafts|shared|saved)$/.test(value)) return value;
  if (/^\/(?:lab)?\?mode=(pic|thought)(?:&(?:draft|taste)=[0-9a-f-]{36})?$/.test(value)) return value.startsWith('/?') ? '/lab'+value.slice(1) : value;
  if (/^\/lab\?draft=[0-9a-f-]{36}(?:&mode=(pic|thought))?$/.test(value)) return value;
  return "/";
}
