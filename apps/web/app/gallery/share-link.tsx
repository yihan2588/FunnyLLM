"use client";

import { useEffect, useRef, useState } from "react";
import { siteOrigin } from "@/lib/site";

export function ShareLink({ id, caption }: { id: string; caption: string }) {
  const url = siteOrigin + "/meme/" + id;
  const field = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  // These controls are mounted by a visitor action, after hydration.
  const nativeAvailable = typeof navigator !== "undefined" && typeof navigator.share === "function";

  function manualCopy() {
    field.current?.focus();
    field.current?.select();
    setMessage("Select and copy the link to share this meme.");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Link copied.");
    } catch { manualCopy(); }
  }

  async function send() {
    try {
      await navigator.share({ title: caption, url });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) manualCopy();
    }
  }

  return <div className="funny-share-link">
    <label>Public meme link<input ref={field} type="url" readOnly value={url} onFocus={event => event.currentTarget.select()} /></label>
    <div><button type="button" className="cw-primary" onClick={copy}>Copy link</button>
      {nativeAvailable && <button type="button" className="cw-secondary" onClick={send}>Share via…</button>}</div>
    <p role="status">{message}</p>
  </div>;
}

export function GalleryShare({ id, caption }: { id: string; caption: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, [open]);

  return <>
    <button type="button" className="cw-link" aria-haspopup="dialog" onClick={() => setOpen(true)}>Share</button>
    {open && <dialog className="cw-publish funny-share-dialog" ref={dialog} aria-label="Share this meme"
      onCancel={event => { event.preventDefault(); setOpen(false); }}>
      <h2>Share this meme</h2><p>{caption}</p>
      <ShareLink id={id} caption={caption} />
      <button type="button" className="cw-link" onClick={() => setOpen(false)}>Done</button>
    </dialog>}
  </>;
}
