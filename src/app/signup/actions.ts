import { createBrowserClient } from "@supabase/ssr";

export async function signup(email: string, password: string) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return await supabase.auth.signUp({
    email,
    password,
  });
}
