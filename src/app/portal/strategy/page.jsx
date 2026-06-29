"use client";

import React from "react";
import dynamic from "next/dynamic";

const PortalStrategy = dynamic(() => import("../../../views/portal/PortalStrategy"), {
  ssr: false,
});

export default function PortalStrategyRoute() {
  return <PortalStrategy />;
}
