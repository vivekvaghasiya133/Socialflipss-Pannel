"use client";

import React from "react";
import dynamic from "next/dynamic";

const PortalScripts = dynamic(() => import("../../../views/portal/PortalScripts"), {
  ssr: false,
});

export default function PortalScriptsRoute() {
  return <PortalScripts />;
}
