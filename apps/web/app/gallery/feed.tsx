import Link from "next/link";
import { PostCard } from "./post-card";
import type { GalleryResult } from "./types";
export function GalleryFeed({ result, signedIn, page, base, emptyTitle = "The gallery is warming up.", emptyText = "Make a meme in Funny Lab and share your favorite take." }: { result: GalleryResult; signedIn: boolean; page: number; base: string; emptyTitle?: string; emptyText?: string }) {
  return <>
    {result.posts.length ? <div className="funny-gallery-grid">{result.posts.map((post, index) => <PostCard first={index === 0} key={post.id} post={post} signedIn={signedIn} />)}</div> : <section className="funny-empty"><h2>{page > 1 ? "No more memes on this page." : emptyTitle}</h2><p>{page > 1 ? "Head back to the first page for the latest." : emptyText}</p><Link className="cw-secondary" href={page > 1 ? base : "/lab"}>{page > 1 ? "Back to the first page" : "Open Funny Lab"}</Link></section>}
    <nav className="funny-pagination" aria-label="Gallery pages">{page > 1 && <Link className="cw-secondary" href={`${base}&page=${page - 1}`}>Previous page</Link>}{result.more && <Link className="cw-secondary" href={`${base}&page=${page + 1}`}>Next page</Link>}</nav>
  </>;
}
