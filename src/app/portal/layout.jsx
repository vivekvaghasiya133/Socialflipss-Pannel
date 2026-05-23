"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { OutletProvider } from "../../compat/react-router-dom";

const PortalLayout = dynamic(() => import("../../components/portal/PortalLayout"), {
  ssr: false,
});

export default function ClientPortalLayout({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("sf_portal_token");
    if (!token) {
      router.replace("/portal/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return null; // Don't render until client token verification passes
  }

  return (
    <OutletProvider value={children}>
      <PortalLayout />
    </OutletProvider>
  );
}
