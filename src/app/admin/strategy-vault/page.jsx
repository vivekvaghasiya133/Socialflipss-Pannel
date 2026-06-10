"use client";

import React from "react";
import dynamic from "next/dynamic";

const StrategyVaultPage = dynamic(() => import("../../../views/StrategyVaultPage"), {
  ssr: false,
});

export default function StrategyVaultRoute() {
  return <StrategyVaultPage />;
}
