"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Suspense } from "react";
import Loading from "./loading";
import ProfileContentWrapper from "@/components/ProfileContentWrapper";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return (
    <Suspense fallback={<Loading />}>
      <ProfileContentWrapper />
    </Suspense>
  );
}
