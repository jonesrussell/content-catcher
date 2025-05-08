import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="mb-8 text-4xl font-bold">Welcome to Content Catcher</h1>
        <p className="mb-8 text-xl">
          Your personal content management assistant
        </p>
        <div className="flex gap-4">
          <a
            href="/login"
            className="bg-primary hover:bg-primary/90 rounded-lg px-8 py-4 text-lg text-white"
          >
            Get Started
          </a>
        </div>
      </div>
    </main>
  );
}
