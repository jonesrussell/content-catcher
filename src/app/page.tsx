"use client";

import ContentEditor from "@/components/ContentEditor";
import { Toaster } from "react-hot-toast";
import { SavedContentSection } from "@/components/SavedContentSection";
import { useState } from "react";

export default function Home() {
  const [isNewContentModalOpen, setIsNewContentModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleContentSaved = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Content Catcher</h1>
        <ContentEditor
          onContentSaved={handleContentSaved}
          key={refreshKey}
        />
        <SavedContentSection onContentUpdated={handleContentSaved} />
      </div>
      <Toaster />
    </main>
  );
}
