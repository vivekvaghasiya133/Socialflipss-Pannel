"use client";

import React from "react";
import dynamic from "next/dynamic";

const LeadsPage = dynamic(() => import("../../../views/LeadsPage"), {
  ssr: false,
});

export default function LeadsRoute() {
  return <LeadsPage />;
}
