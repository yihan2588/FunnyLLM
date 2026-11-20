import type { Metadata } from "next";
import { cache } from "react";
import { siteOrigin } from "@/lib/site";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { isUuid } from "@/lib/navigation";
import { SiteHeader, SiteFooter } from "@/app/site-header";
import { galleryFeed } from "@/app/gallery/feed-data";
import { PostCard } from "@/app/gallery/post-card";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

const publicPost = cache(async (id: string) => {
  if (!isUuid(id)) notFound();
  const { posts } = await galleryFeed("latest", 1, "", id);
  if (!posts[0]) notFound();
  return posts[0];
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await publicPost(id);
  const url = siteOrigin + "/meme/" + id;
  const image = { url: url + "/preview", alt: post.caption, width: 1200, height: 630 };
  const description = "A meme by " + post.author_name + " on FunnyLLM.";
  return {
    title: post.caption, description,
    openGraph: { type: "article", url, title: post.caption, description, images: [image] },
    twitter: { card: "summary_large_image", title: post.caption, description, images: [image] },
  };
}

export default async function Meme({ params }: Props) {
  const { id } = await params;
  const [user, post] = await Promise.all([getUser(), publicPost(id)]);
  return <div className="cw-app"><SiteHeader active="gallery"/><main id="main-content" className="funny-meme-page"><Link className="cw-link" href="/">Back to the gallery</Link><h1 className="cw-sr">A meme by {post.author_name}</h1><PostCard post={post} signedIn={!!user} detail/></main><SiteFooter/></div>;
}
