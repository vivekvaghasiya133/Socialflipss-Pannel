"use client";

import React from "react";
import dynamic from "next/dynamic";

const AgencyBillingView = dynamic(() => import("../../../views/AgencyBillingView"), {
  ssr: false,
});

export default function AgencyBillingRoute() {
  return <AgencyBillingView />;
}
