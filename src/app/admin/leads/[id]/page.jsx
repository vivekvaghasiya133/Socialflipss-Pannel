"use client";

import React from "react";
import dynamic from "next/dynamic";

const LeadDetail = dynamic(() => import("../../../../views/LeadDetail"), {
  ssr: false,
});

export default function LeadDetailRoute() {
  return <LeadDetail />;
}
