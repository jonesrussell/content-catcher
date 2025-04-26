"use client";

import { AuthProvider } from "@/lib/auth-context";
import { ContentProvider } from "@/lib/content-context";
import { Toaster } from "react-hot-toast";
import { GlobalErrorHandler } from "@/utils/global-error-handler";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ContentProvider>
        {children}
        <GlobalErrorHandler />
        <Toaster position="bottom-right" />
      </ContentProvider>
    </AuthProvider>
  );
} 