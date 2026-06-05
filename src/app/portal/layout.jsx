"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { OutletProvider } from "../../compat/react-router-dom";

const PortalLayout = dynamic(() => import("../../components/portal/PortalLayout"), {
  ssr: false,
});

export default function ClientPortalLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  const isLoginPage = pathname === "/portal/login";

  useEffect(() => {
    if (isLoginPage) {
      setAuthorized(true);
      return;
    }
    const token = localStorage.getItem("sf_portal_token");
    if (!token) {
      router.replace("/portal/login");
    } else {
      setAuthorized(true);
    }
  }, [router, isLoginPage]);

  if (!authorized) {
    return null; // Don't render until client token verification passes
  }

  if (isLoginPage) {
    return (
      <OutletProvider value={children}>
        {children}
      </OutletProvider>
    );
  }

  return (
    <OutletProvider value={children}>
      <PortalLayout />
    </OutletProvider>
  );
}
