"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MemePreview } from "@/app/meme-preview";
import type { GalleryPost } from "./types";

import { GalleryShare } from "./share-link";

type Action = "like" | "save" | "report" | "unpublish" | "republish";
export function PostCard({ post, signedIn, detail = false, first = false }: { post: GalleryPost; signedIn: boolean; detail?: boolean; first?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false), [refreshing, refresh] = useTransition();
  const [error, setError] = useState(""), [notice, setNotice] = useState(""), [reporting, setReporting] = useState(false), [reason, setReason] = useState("");
  const disabled = busy || refreshing;
  const returnTo = `/meme/${post.id}`;
  const login = `/login?next=${encodeURIComponent(returnTo)}`;
  const option = { id: post.id, image_id: post.id, caption: post.caption, alt: post.alt, width: post.width, height: post.height, angle: "", intent_bridge: "", preserve_on_edit: "" };
  async function act(action: Action, value?: boolean) {
    if (!signedIn) { router.push(login); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/gallery/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: post.id, action, value, ...(action === "report" ? { reason } : {}) }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "This change could not be saved.");
      if (action === "report") { setNotice("Report sent to the admin team."); setReporting(false); setReason(""); }
      if (action === "unpublish") { setNotice("Removed from the public gallery. You can publish it again here."); if (detail) { router.push("/creations?tab=shared"); return; } }
      if (action === "republish") setNotice("Your meme is public again.");
      refresh(() => router.refresh());
    } catch (e) { setError(e instanceof Error ? e.message : "This change could not be saved. Please try again."); }
    finally { setBusy(false); }
  }
  async function remix() {
    if (!signedIn) { router.push(login); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/gallery/remix", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: post.id }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "This meme could not be opened in the lab.");
      router.push(`/lab?mode=pic&draft=${encodeURIComponent(data.state.id)}`);
    } catch (e) { setError(e instanceof Error ? e.message : "This meme could not be opened in the lab."); setBusy(false); }
  }
  async function download() {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/gallery/export?id=${post.id}`);
      if (!response.ok) { const data = await response.json(); throw new Error(data.error ?? "This meme could not be downloaded."); }
      const url = URL.createObjectURL(await response.blob()), link = document.createElement("a");
      link.href = url; link.download = "funnyllm-meme.png"; link.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
      setNotice("Your captioned meme is ready.");
    } catch (e) { setError(e instanceof Error ? e.message : "This meme could not be downloaded."); }
    finally { setBusy(false); }
  }
  const image = <MemePreview framed={!detail} first={first} option={option}
    url={`/api/gallery/image?id=${post.id}${detail ? "" : "&size=card"}`} />;
  return <article className={`funny-post${detail ? " funny-post-detail" : ""}`} aria-label={`Meme by ${post.author_name}`} aria-busy={disabled}>
    {detail || post.status !== "published" ? image : <Link className="funny-post-image" href={returnTo} prefetch={false} aria-label={`Open meme: ${post.caption}`}>{image}</Link>}
    <div className="funny-post-body"><div className="funny-byline"><span>By {post.author_name}</span>{post.featured && <span className="funny-featured">Featured</span>}{post.status !== "published" && <span className="funny-status-label">{post.status === "removed" ? "Removed by admin" : "Private"}</span>}</div>
    <div className="funny-post-actions">
      {post.status === "published" && <><button className="cw-link" disabled={disabled} onClick={() => act("like", !post.liked)} aria-pressed={post.liked} aria-label={`${post.liked ? "Unlike" : "Like"} meme`}>{post.liked ? "Liked" : "Like"} <span>{post.like_count}</span></button><button className="cw-link" disabled={disabled} onClick={() => act("save", !post.saved)} aria-pressed={post.saved}>{post.saved ? "Saved" : "Save"}</button><button className="cw-link" disabled={disabled} onClick={remix}>Remix</button></>}
      {post.status === "published" && <GalleryShare id={post.id} caption={post.caption} />}
      <button className="cw-link" onClick={download} disabled={disabled}>Download</button>
    </div>
    {detail && <p className="funny-post-date">Shared {new Date(post.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" })}</p>}
    <details className="funny-post-menu"><summary>More options</summary><div>
      {post.status === "published" && <><button className="cw-link" disabled={disabled} onClick={() => { if (!signedIn) router.push(login); else setReporting(v => !v); }}>Report this meme</button></>}
      {post.owned && post.status === "published" && <button className="cw-link" disabled={disabled} onClick={() => act("unpublish")}>Remove from gallery</button>}
      {post.owned && post.status === "unpublished" && <button className="cw-link" disabled={disabled} onClick={() => act("republish")}>Publish again</button>}
      {post.status === "removed" && <p>This meme was removed by an admin. It cannot be republished here.</p>}
    </div></details>
    {reporting && <form className="funny-report" onSubmit={e => { e.preventDefault(); void act("report"); }}><label htmlFor={`report-${post.id}`}>What should we review?</label><textarea id={`report-${post.id}`} minLength={5} maxLength={500} required value={reason} onChange={e => setReason(e.target.value)} disabled={disabled} /><div><button className="cw-secondary" disabled={disabled}>Send report</button><button className="cw-link" type="button" onClick={() => setReporting(false)} disabled={disabled}>Cancel</button></div></form>}
    {error && <p className="funny-inline-error" role="alert">{error}</p>}{notice && <p className="cw-hint" role="status">{notice}</p>}
    </div>
  </article>;
}
