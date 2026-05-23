"use client";

import React from "react";
import dynamic from "next/dynamic";

const PortalDashboard = dynamic(() => import("../../views/portal/PortalDashboard"), {
  ssr: false,
});

export default function PortalDashboardRoute() {
  return <PortalDashboard />;
}
