import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient({ anonymous = false }: { anonymous?: boolean } = {}) {
  const cookieStore = anonymous ? null : await cookies();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are missing.");

  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore?.getAll() ?? [],
      setAll(cookiesToSet) {
        // Server Components cannot write cookies; proxy.ts refreshes them first.
        // Server Actions and Route Handlers persist login/logout cookies here.
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore?.set(name, value, options));
        } catch {
          // Only the read-only Server Component context is expected here.
        }
      },
    },
  });
}
