"use client";

import React from "react";
import dynamic from "next/dynamic";

const SalaryPage = dynamic(() => import("../../../views/SalaryPage"), {
  ssr: false,
});

export default function SalaryRoute() {
  return <SalaryPage />;
}
