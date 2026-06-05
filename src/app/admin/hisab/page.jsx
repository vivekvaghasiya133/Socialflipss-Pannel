"use client";

import React from "react";
import dynamic from "next/dynamic";

const HisabPage = dynamic(() => import("../../../views/HisabPage"), {
  ssr: false,
});

export default function HisabRoute() {
  return <HisabPage />;
}
