"use client";

import React from "react";
import dynamic from "next/dynamic";

const ContentCalendar = dynamic(() => import("../../../views/ContentCalendar"), {
  ssr: false,
});

export default function ContentCalendarRoute() {
  return <ContentCalendar />;
}
