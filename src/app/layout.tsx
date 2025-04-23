import React from "react";
import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import {
  ErrorBoundaryClient,
  DOMInspector,
} from "@/utils/creatr.scripts";
import { GlobalErrorHandler } from "@/utils/global-error-handler";

export const metadata: Metadata = {
  title: "Content Collector",
  description: "A beautiful content collection app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const ErrorBoundaryWrapper: React.FC<{ children: React.ReactNode }> = (
  props,
) => {
  const ErrorBoundaryComponent =
    ErrorBoundaryClient as unknown as React.ComponentType<any>;
  return <ErrorBoundaryComponent {...props} />;
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <AuthProvider>
          <Header />
          <div className="pt-16">
            <GlobalErrorHandler />
            <DOMInspector>
              <ErrorBoundaryWrapper>
                {children}
              </ErrorBoundaryWrapper>
            </DOMInspector>
          </div>
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
