"use client";

import React from "react";
import dynamic from "next/dynamic";

const AgencySettingsPage = dynamic(() => import("../../../views/AgencySettingsPage"), {
  ssr: false,
});

export default function AgencySettingsRoute() {
  return <AgencySettingsPage />;
}
