import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import ContentEditor from "@/components/ContentEditor";
import { Toaster } from "react-hot-toast";
import { SavedContentSection } from "@/components/SavedContentSection";
import type { Content } from "@/types/content";

export default async function Home() {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  const { data: contents } = await supabase
    .from('content')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Content Catcher</h1>
        <ContentEditor
          initialContent={contents?.[0] as Content}
        />
        <SavedContentSection initialContents={contents as Content[]} />
      </div>
      <Toaster />
    </main>
  );
}
