"use client";

import React from "react";
import dynamic from "next/dynamic";

const LeavesPage = dynamic(() => import("../../../views/LeavesPage"), {
  ssr: false,
});

export default function LeavesRoute() {
  return <LeavesPage />;
}
