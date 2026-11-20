import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { isUuid } from "@/lib/navigation";
import { SiteHeader, SiteFooter } from "@/app/site-header";
import { galleryFeed, pageNumber } from "./gallery/feed-data";
import { GalleryFeed } from "./gallery/feed";
export const dynamic = "force-dynamic";
export default async function Home({ searchParams }: { searchParams: Promise<{ mode?: string; draft?: string; filter?: string; page?: string; q?: string }> }) {
  const params = await searchParams;
  if (params.mode === "pic" || params.mode === "thought" || isUuid(params.draft)) redirect(`/lab?mode=${params.mode === "thought" ? "thought" : "pic"}${isUuid(params.draft) ? `&draft=${params.draft}` : ""}`);
  const filter = params.filter === "featured" ? "featured" : "latest", page = pageNumber(params.page), query = (params.q ?? "").trim().slice(0,120);
  const [user, result] = await Promise.all([getUser(), galleryFeed(filter, page, query).catch(() => null)]);
  const base = `/?filter=${filter}&q=${encodeURIComponent(query)}`;
  return <div className="cw-app"><SiteHeader active="gallery"/><main id="main-content">
    <section className="funny-page-intro"><div><h1>Your funny meme maker</h1><p>Start with a photo or a thought. Pick a meme and make the punchline yours.</p></div><div className="funny-intro-actions"><Link className="cw-primary" href="/lab">Make a meme</Link><Link className="cw-secondary" href="/example">Try a real example</Link></div></section>
    <section aria-label="Funny gallery"><div className="funny-toolbar"><nav className="funny-tabs" aria-label="Gallery views"><Link href={`/?filter=latest&q=${encodeURIComponent(query)}`} aria-current={filter === "latest" ? "page" : undefined}>Newest</Link><Link href={`/?filter=featured&q=${encodeURIComponent(query)}`} aria-current={filter === "featured" ? "page" : undefined}>Featured</Link></nav><form className="funny-search" action="/"><input type="hidden" name="filter" value={filter}/><label className="cw-sr" htmlFor="gallery-search">Search captions</label><input id="gallery-search" type="search" name="q" defaultValue={query} maxLength={120} placeholder="Search captions"/><button className="cw-secondary">Search</button>{query && <Link className="cw-link" href={`/?filter=${filter}`}>Clear</Link>}</form></div>
    {result ? <GalleryFeed result={result} signedIn={!!user} page={page} base={base} emptyTitle={query ? "No captions match that search." : undefined} emptyText={query ? "Try another word or clear your search." : undefined}/> : <div className="funny-empty" role="alert"><h2>The gallery could not load.</h2><p>Your drafts are safe. Try loading the gallery again.</p><Link className="cw-secondary" href={base}>Try again</Link></div>}
    </section></main><SiteFooter/></div>;
}
