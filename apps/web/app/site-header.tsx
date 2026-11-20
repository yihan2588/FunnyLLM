import Link from "next/link";
import { getUser } from "@/lib/auth";
import { adminOrigin } from "@/lib/site";
import { signOut } from "@/app/auth/actions";

export async function SiteHeader({ active }: { active?: "gallery" | "lab" | "creations" }) {
  const user = await getUser();
  return <header className="cw-header funny-header">
    <Link className="cw-brand" href="/" aria-label="FunnyLLM home">FunnyLLM</Link>
    <nav className="funny-main-nav" aria-label="Main navigation">
      <Link href="/" aria-current={active === "gallery" ? "page" : undefined}>Gallery</Link>
      <Link href="/lab" aria-current={active === "lab" ? "page" : undefined}>Funny Lab</Link>
      <Link href="/creations" aria-current={active === "creations" ? "page" : undefined}>My creations</Link>
    </nav>
    {user ? <details className="funny-account"><summary className="cw-secondary funny-account-toggle"><span>Account</span><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></summary><div><Link href="/profile">Your profile</Link><a href={`${adminOrigin}/admin`}>Admin</a><form action={signOut}><button className="cw-link">Sign out</button></form></div></details> : active === "lab" ? <button className="cw-secondary funny-signin" type="submit" form="cw-create" formNoValidate>Sign in</button> : <Link className="cw-secondary funny-signin" href="/login">Sign in</Link>}
  </header>;
}
export function SiteFooter() {
  return <footer className="cw-footer funny-footer"><span>A picture. A thought. Your sense of humor.</span><div><Link href="/privacy">Privacy & how it works</Link></div></footer>;
}
