"use client";

import React from "react";
import dynamic from "next/dynamic";

const StaffTimeTracker = dynamic(() => import("../../../views/StaffTimeTracker"), {
  ssr: false,
});

export default function TimeTrackingRoute() {
  return <StaffTimeTracker />;
}
