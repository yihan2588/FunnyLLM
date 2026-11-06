export class CowriterError extends Error { readonly status: number; constructor(message: string, status = 502) { super(message); this.status=status; } }

// Keep ordinary first-person punchlines ("I can't work under these conditions").
export function isWriterRefusal(text: string) {
  const reply=text.trim().replace(/^(?:(?:i(?:['’]m| am) sorry|sorry)[,!. ]+)(?:but )?/i,"");
  if (/^as an ai(?: language model| assistant)?[, ]+i (?:can|must|am)/i.test(reply)) return true;
  const rest=reply.replace(/^i(?: can(?:not|['’]t)| am unable to|['’]m unable to)\s+/i,"");
  if (rest===reply) return false;
  return /^(?:help|assist) (?:with (?:that|this|your request)\b|you (?:with|create|write)\b)/i.test(rest)
    || /^(?:generate|write|provide|create) (?:that|this|such|explicit|sexual|harmful|offensive|hateful)\b/i.test(rest);
}
export class WriterRefusal extends CowriterError {
  constructor() { super("Try making the joke about an object or situation, or change a required phrase.", 422); }
}
export async function withCleanAngle<T>(write: (clean: boolean) => Promise<T>, signal: AbortSignal) {
  try { return await write(false); }
  catch (error) {
    if (!(error instanceof WriterRefusal) || signal.aborted) throw error;
    return write(true);
  }
}
