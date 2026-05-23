"use client";

import React from "react";
import dynamic from "next/dynamic";

const PortalContent = dynamic(() => import("../../../views/portal/PortalContent"), {
  ssr: false,
});

export default function PortalContentRoute() {
  return <PortalContent />;
}
