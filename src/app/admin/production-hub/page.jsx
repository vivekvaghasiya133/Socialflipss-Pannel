"use client";

import React from "react";
import dynamic from "next/dynamic";

const ProductionHub = dynamic(() => import("../../../views/ProductionHub"), {
  ssr: false,
});

export default function ProductionHubRoute() {
  return <ProductionHub />;
}
