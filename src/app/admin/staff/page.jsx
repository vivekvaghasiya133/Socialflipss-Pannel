"use client";

import React from "react";
import dynamic from "next/dynamic";

const StaffPage = dynamic(() => import("../../../views/StaffPage"), {
  ssr: false,
});

export default function StaffRoute() {
  return <StaffPage />;
}
