"use client";

import React from "react";
import dynamic from "next/dynamic";

const PortalLogin = dynamic(() => import("../../../views/portal/PortalLogin"), {
  ssr: false,
});

export default function PortalLoginRoute() {
  return <PortalLogin />;
}
