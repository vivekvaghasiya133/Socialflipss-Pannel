"use client";

import React from "react";
import dynamic from "next/dynamic";

const StaffCalendarView = dynamic(() => import("../../../../../views/StaffCalendarView"), {
  ssr: false,
});

export default function StaffCalendarRoute() {
  return <StaffCalendarView />;
}
