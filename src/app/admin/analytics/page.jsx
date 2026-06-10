"use client";

import React from "react";
import dynamic from "next/dynamic";

const ContentAnalyticsPage = dynamic(() => import("../../../views/ContentAnalyticsPage"), {
  ssr: false,
});

export default function AnalyticsRoute() {
  return <ContentAnalyticsPage />;
}
