import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requestOrigin } from "@/lib/request-origin";
import { safeReturn } from "@/lib/navigation";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const origin = requestOrigin(request.headers);
  const supabase = await createClient();
  const destination = safeReturn(request.cookies.get("humor_return")?.value);
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const response = NextResponse.redirect(new URL(destination, origin));
      response.cookies.delete("humor_return");
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
  }
  const response = NextResponse.redirect(new URL("/login?error=callback&next=" + encodeURIComponent(destination), origin));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
