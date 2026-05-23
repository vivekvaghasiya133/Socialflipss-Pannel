"use client";

import React from "react";
import dynamic from "next/dynamic";

const ShootSchedulerPage = dynamic(() => import("../../../../../views/ShootSchedulerPage"), {
  ssr: false,
});

export default function ShootSchedulerRoute() {
  return <ShootSchedulerPage />;
}
