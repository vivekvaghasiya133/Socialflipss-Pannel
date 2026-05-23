"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

const UsersPage = dynamic(() => import("../../../views/UsersPage"), {
  ssr: false,
});

export default function UsersRoute() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (!isAdmin) {
        router.replace("/admin");
      }
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !user || !isAdmin) {
    return null;
  }

  return <UsersPage />;
}
