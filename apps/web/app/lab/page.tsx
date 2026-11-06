import { createClient } from "@/lib/supabase/server";
import { tasteMenuItem } from "@/lib/cowriter/contracts";
import { getUser } from "@/lib/auth";
import { Cowriter } from "@/app/cowriter/cowriter";
import { SiteHeader, SiteFooter } from "@/app/site-header";
import { isUuid } from "@/lib/navigation";
export const metadata = { title: "Funny Lab — FunnyLLM" };
export const dynamic = "force-dynamic";
export default async function Lab({ searchParams }: { searchParams: Promise<{ mode?: string; draft?: string; taste?: string }> }) {
  const [user, params, menu] = await Promise.all([getUser(), searchParams, createClient().then(client=>client.rpc("funny_taste_menu"))]);
  const parsed = tasteMenuItem.array().max(5).safeParse(menu.data);
  return <div className="cw-app"><SiteHeader active="lab"/><main id="main-content"><Cowriter tastes={parsed.success ? parsed.data : []} menuUnavailable={!!menu.error || !parsed.success} initialTaste={params.taste} signedIn={!!user} initialMode={params.mode === "thought" ? "thought" : "pic"} initialDraft={isUuid(params.draft) ? params.draft : undefined}/></main><SiteFooter/></div>;
}
