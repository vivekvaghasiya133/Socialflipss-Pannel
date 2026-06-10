"use client";

import React from "react";
import dynamic from "next/dynamic";

const TeamDashboard = dynamic(() => import("../../../views/TeamDashboard"), {
  ssr: false,
});

export default function TeamDashboardRoute() {
  return <TeamDashboard />;
}
