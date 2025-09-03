import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return (cookieStore as any).get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          (cookieStore as any).set(name, value, options);
        },
        remove(name: string, options: any) {
          (cookieStore as any).set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );
}
