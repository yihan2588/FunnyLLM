import assert from "node:assert/strict";
import { test } from "node:test";
import { rememberDraft, restoreDraft } from "../lib/cowriter/sign-in-draft.ts";

const draft = { mode: "thought", thought: "Meeting about the meeting", spirit: "", locks: "Keep Monday", hadPhoto: false };

function tab() {
  const entries = new Map();
  return { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) };
}

test("an interrupted login retains the wording until a matching authenticated return consumes it", () => {
  const storage = tab();
  rememberDraft(storage, draft);
  assert.equal(restoreDraft(storage, "pic", true), undefined);
  assert.equal(restoreDraft(storage, "thought", false).locks, draft.locks);
  assert.equal(restoreDraft(storage, "thought", true).thought, draft.thought);
  assert.equal(restoreDraft(storage, "thought", true), undefined);
});

test("old handoffs expire before another session can restore them", context => {
  context.mock.timers.enable({apis: ["Date"], now: Date.now()});
  const storage = tab();
  rememberDraft(storage, draft);
  context.mock.timers.tick(31 * 60_000);
  assert.equal(restoreDraft(storage, "thought", true), undefined);
});
