"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "./ui/button";
import { User } from "lucide-react";

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className={`flex items-center justify-between p-4 ${className}`}>
      <div className="flex items-center gap-4">
        <Link href="/" className="text-xl font-bold">
          Content Catcher
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
            Dashboard
          </Link>
          <Link href="/saved" className="text-gray-700 hover:text-gray-900">
            Saved Content
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          onClick={() => router.push("/profile")}
        >
          <User className="h-4 w-4" />
          Profile
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </div>
    </header>
  );
}
