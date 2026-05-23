"use client";

import React from "react";
import dynamic from "next/dynamic";

const DashboardHome = dynamic(() => import("../../views/DashboardHome"), {
  ssr: false,
});

export default function AdminDashboardIndex() {
  return <DashboardHome />;
}
