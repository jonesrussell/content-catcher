"use client";

import dynamic from "next/dynamic";
import Loading from "@/app/profile/loading";

const ProfileContent = dynamic(() => import("@/components/ProfileContent"), {
  ssr: false,
  loading: () => <Loading />,
});

export default function ProfileContentWrapper() {
  return <ProfileContent />;
}
