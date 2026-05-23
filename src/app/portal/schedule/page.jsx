"use client";

import React from "react";
import dynamic from "next/dynamic";

const PortalSchedule = dynamic(
  () => import("../../../views/portal/PortalPages").then((mod) => mod.PortalSchedule),
  { ssr: false }
);

export default function PortalScheduleRoute() {
  return <PortalSchedule />;
}
