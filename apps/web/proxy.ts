import { legacyPageRedirect } from "@/lib/site";
import { requestOrigin } from "@/lib/request-origin";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const destination = legacyPageRedirect(requestOrigin(request.headers), request.nextUrl.pathname, request.nextUrl.search, request.method);
  if (destination) return NextResponse.redirect(destination, 308);
  let response = NextResponse.next({ request });
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return response;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, cacheHeaders) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(cacheHeaders).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });
  await supabase.auth.getClaims();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/", "/example", "/privacy", "/lab", "/creations", "/meme/:path*", "/api/gallery/:path*", "/login", "/profile/:path*", "/auth/:path*", "/api/cowriter/:path*"],
};
